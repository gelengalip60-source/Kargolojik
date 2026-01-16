from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import httpx
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import asyncio
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Branch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company: str
    city: str
    district: str
    address: str
    phone: str
    working_hours: dict = {}
    google_maps_url: str = ""
    logo_url: str = ""
    source_url: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BranchCreate(BaseModel):
    name: str
    company: str
    city: str
    district: str
    address: str
    phone: str
    working_hours: dict = {}
    google_maps_url: str = ""
    logo_url: str = ""
    source_url: str = ""

class HelpTopic(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    short_description: str
    content: str
    icon: str = "help-circle"
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BranchSearchResponse(BaseModel):
    branches: List[Branch]
    total: int
    page: int
    limit: int

# ============ HELP TOPICS DATA ============

HELP_TOPICS_DATA = [
    {
        "id": "sektor-gercekleri",
        "title": "Kargo Şirketlerinin Çalışma Modeli ve Sektör Gerçekleri",
        "short_description": "Pandemi sonrası değişen iş yükü, personel dinamikleri ve şube işleyişinin perde arkası.",
        "icon": "briefcase",
        "order": 1,
        "content": """## Sektörün Gerçek Sorunu: Personel Sirkülasyonu

Kargo sektöründeki memnuniyetsizliğin ana kaynağı personel eksikliğidir. Düşük maaş politikası ve ağır fiziksel tempo, personelin sürekli değişmesine neden olur. Bölgeyi tanımadan işten ayrılan her personel, kargoların gecikmesine veya yanlış adrese gitmesine yol açan bir zinciri başlatır.

## Operasyonel Süreçte Neden Aksaklık Yaşanır?

Kargo yükünün pandemiyle beraber 3 katına çıkması, altyapısı ve personeli hazır olmayan şirketleri kapasite aşımı sorunuyla karşı karşıya bırakmıştır:

- **📈 Aşırı İş Yükü:** Personel başına düşen kargo sayısının artması, dikkat dağınıklığına ve fiziksel yorgunluğa bağlı hataları (yanlış adres, hasarlı koli) beraberinde getirir.
- **📍 Bölge Tecrübesi:** Adresleri ezberlemek zaman alır. Deneyimli personelin istifası, o bölgedeki dağıtım kalitesini doğrudan düşürür.
- **🏬 Şube Baskısı:** Bölge müdürlükleri şubelere tüm kargoları dağıtma baskısı yapar. Kasıtlı bekletme yoktur; yaşanan gecikmeler tamamen yetişilememekten kaynaklıdır.

## Google Puanları Neden Hep Düşük?

Hemen hemen her kargo şirketinin puanı çok düşüktür. Bunun sebebi, sektörün gerçeklerinin (yoğunluk, personel yetersizliği) bilinmemesidir. Hiçbir şirket kasten verimsiz çalışmak istemez; düşük puanlar aslında sistemin insan gücüyle yetişemediği o devasa hacmin bir yansımasıdır.

> **Kargolojik Notu:** Kargo süreçlerinde yaşanan sorunların çözümü, personelin iş yükünün dengelenmesi ve maaş politikalarının iyileştirilmesinden geçer. Kullanıcı olarak sabırlı olmak ve şube ile sağlıklı iletişim kurmak, sorunu çözmenin en hızlı yoludur."""
    },
    {
        "id": "hasar-tutanak",
        "title": "Hasar ve Tutanak Prosedürü",
        "short_description": "Gönderinin hasarlı olması durumunda izlenmesi gereken yasal prosedürler.",
        "icon": "alert-triangle",
        "order": 2,
        "content": """## ⚠️ Altın Kural: Hasarlı Paketi Teslim Almayın!

Kargo dış ambalajında gözle görülür bir hasar (ezilme, ıslanma, yırtılma) mevcutsa paketi kesinlikle teslim almayınız. Paketin teslim alınması, gönderinin sağlam ve eksiksiz bir şekilde ulaştığının yasal olarak kabul edilmesi anlamına gelmektedir.

## Tutanak Yetkisi ve Prosedür

Sektörel uygulamada sıklıkla karşılaşılan yanılgının aksine, kuryelerin resmi tutanak düzenleme yetkisi bulunmamaktadır. Tutanak tanzim etme yetkisi münhasıran ilgili kargo şubesine aittir.

1. Hasarlı paketi teslim almayarak kuryeye iade sürecini başlatması gerektiğini bildirin.
2. Paketin şubeye geri dönmesiyle birlikte, şube yetkilileri tarafından durum tespit edilerek resmi "Hasar Tespit Tutanağı" düzenlenmelidir.
3. Tutanak tutulmadan şubeden çıkan paketlerde tüm sorumluluk alıcıya geçmektedir.

> **Resmi Not:** 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, kargo şirketleri taşıma sırasında meydana gelen zararlardan doğrudan sorumludur. Ancak bu sorumluluğun belgelendirilmesi için şube onaylı tutanak şarttır."""
    },
    {
        "id": "gizli-hasar",
        "title": "Gizli Hasar ve Tazminat Prosedürü",
        "short_description": "Dış ambalajı hasarsız olup, içeriği zarar görmüş gönderilerde hak arama rehberi.",
        "icon": "eye-off",
        "order": 3,
        "content": """## Şube Savunması: "Ambalaj Sağlamdı"

Şubelerin "ambalaj sağlam, sorumluluk kabul etmiyoruz" beyanı, gizli hasar durumlarında her zaman geçerli bir savunma değildir. Eğer ürün faturası varsa ve hasar kullanım hatasından kaynaklanmıyorsa, tazmin süreci yasal haklar çerçevesinde takip edilmelidir.

## A. E-Ticaret Alışverişleri

Satın alınan ürün bir e-ticaret platformu üzerinden gelmişse, hasar tespit edildiği an satın alınan platform üzerinden "İade Talebi" başlatılmalıdır. Bu süreçte muhatabınız kargo şubesi değil, satıcı firmadır.

## B. Bireysel Gönderiler

Şahıstan şahısa gelen gönderilerde hasar durumu için gönderi faturası ile birlikte ilgili kargo şubesine gidilerek "Tazmin Dilekçesi" verilmelidir.

## ⚠️ Fatura Zorunluluğu

Kargo tazminat süreçlerinde en kritik belge ürün faturasıdır. Faturası ibraz edilemeyen gönderiler için herhangi bir hak talep edilmesi hukuken mümkün değildir. Ürünün maddi değeri ancak resmi bir fatura ile ispatlanabilir."""
    },
    {
        "id": "eksik-icerik",
        "title": "Eksik İçerik ve Hasar Kayıp Süreçleri",
        "short_description": "Barkodu düşen kargonun 'Araf' yolculuğu ve kayıp araştırma prosedürü.",
        "icon": "package",
        "order": 4,
        "content": """## Barkodu Düşen Kargonun "Araf" Yolculuğu

Bir kargonun kimliği üzerindeki barkoddur. Barkodu düşen paket, sistemde kör noktaya düşer. Her aktarma merkezinde bu kargoları tespit etmekle görevli "Hasar Kayıp Servisi" bulunur. Kargonuz "çalınmış" değil, sadece barkodsuz kaldığı için bu serviste sahibinin (şubenin) onu tarif etmesini bekliyor olabilir.

## Koli İçinden Ürün Eksilmesi Neden Olur?

Taşıma sırasında ağır kolilerin baskısıyla yırtılan veya patlayan paketlerden ürünler dışarı dökülebilir. Bu durumda boşta kalan ürün, aktarma merkezindeki görevli tarafından korumaya alınır ancak hangi koliye ait olduğu o an bilinemez.

## ⚠️ Eksik İçerik Durumunda İzlenecek Adımlar:

1. **Şubeye Bildirim:** Paket eksik geldiyse vakit kaybetmeden teslimat şubesine gidin.
2. **Kayıp Araştırma Maili:** Şube personelinden, ilgili Aktarma Merkezine "Kayıp Araştırma Maili" atmasını isteyin. Bu mailde ürünün fiziksel özelliklerini (rengi, markası, boyutu) detaylıca tarif ettirin.
3. **E-Ticaret Bildirimi:** Eğer ürün bir online alışveriş sitesinden alındıysa, satıcıya ve siteye "eksik ürün" bildirimi yapın.
4. **Sabır Süresi:** Aktarma merkezindeki "Hasar Kayıp" biriminin ürünü eşleştirmesi için şubeye birkaç gün mühlet verin.

## Personeli Suçlamadan Önce Bilmeniz Gerekenler

Kargo aktarma merkezleri 7/24 yüksek çözünürlüklü kameralarla izlenir. Bir personelin kargo içerisinden ürün çalması operasyonel olarak çok zordur. Eksikliklerin %99'u, taşıma esnasında ambalajın zarar görmesi ve ürünün kutudan düşmesiyle ilgilidir.

> **Çözüm Yolu:** Eğer araştırma sonucunda ürün bulunamazsa, "Hasar Kayıp Tazmin" süreci başlatılmalı ve zarar kargo şirketinden talep edilmelidir."""
    },
    {
        "id": "tazminat-odeme",
        "title": "Tazminat Ödeme Prosedürleri",
        "short_description": "Gönderi değer tespiti ve tazminat tutarının belirlenmesinde uygulanan kriterler.",
        "icon": "dollar-sign",
        "order": 5,
        "content": """## Tazminat Tutarı Belirleme Esasları

Kargo gönderilerinde tazminat süreci başlatıldığında, ödenecek tutar doğrudan fatura üzerinde yazan rakamın otomatik onayı anlamına gelmemektedir. Kargo firmaları, zarar tespiti ve bedel belirleme aşamasında şu kriterleri baz almaktadır:

### 1. Piyasa Değeri ve Rayiç Araştırması

Faturada beyan edilen tutarın, ürünün piyasadaki güncel değeriyle uyumlu olup olmadığı incelenir. Ürün bedelinin gerçeğe aykırı veya piyasa koşullarının çok üzerinde beyan edildiği durumlarda, firma kendi araştırmasını yaparak gerçeğe en yakın rayiç bedel üzerinden ödeme planı oluşturur.

### 2. Yüksek Tutarlı Gönderilerde Kısmi Ödeme

Özellikle çok yüksek tutarlı gönderilerde kargo firmaları, taşıma sözleşmesi ve sorumluluk limitleri çerçevesinde tutarın tamamını değil, belirli bir kısmını tazmin edebilir. Bu durum, gönderi sırasında ek bir sigorta veya değer beyanı yapılmamış olmasıyla doğrudan ilişkilidir.

> **Hukuki Hatırlatma:** Tazminat süreçlerinde hak kaybı yaşamamak için fatura bilgilerinin tam ve doğru olması şarttır. Gerçeği yansıtmayan yüksek beyanlı faturalar, inceleme aşamasında reddedilme veya piyasa rayicine göre revize edilme riski taşımaktadır."""
    },
    {
        "id": "btk-sikayet",
        "title": "BTK Resmi Şikayet Yönetimi",
        "short_description": "e-Devlet üzerinden yapılan başvurularda dikkat edilmesi gereken teknik detaylar.",
        "icon": "file-text",
        "order": 6,
        "content": """## Şikayet Metninde Kullanılması Gereken Teknik Terimler

BTK (Bilgi Teknolojileri ve İletişim Kurumu) üzerinden yapılan başvuruların ciddiyetle ele alınması için metin içerisinde hukuki dayanağı olan teknik terimlerin kullanılması süreci hızlandırmaktadır. Şikayetinizde şu ifadelerden uygun olanlara yer vermeniz önerilir:

1. **Hizmet Kusuru:** Kargonun taahhüt edilen sürede teslim edilmemesi veya operasyonel hatalar için kullanılır.
2. **Gönderi Akıbetinin Belirsizliği:** 7 günü geçen ve takip sisteminde güncellenmeyen paketler için durumun vahametini belirtir.
3. **Mevzuata Aykırılık:** Firmanın Posta Hizmetleri Kanunu ve yönetmeliklerdeki yükümlülüklerini yerine getirmediğini vurgular.
4. **Bilgi Edinme Hakkının Engellenmesi:** Müşteri hizmetlerinin yetersiz kaldığı veya eksik bilgi verdiği durumlar için eklenmelidir.

## Resmi Başvuru Şablonu

> "... numaralı gönderimle ilgili kargo firması üzerinden çözüm sağlanamamıştır. Gönderinin akıbeti belirsizliğini korumakta olup, taahhüt edilen teslimat süresi aşılmıştır. Yaşanan bu hizmet kusurunun giderilmesini, ilgili firmanın Posta Hizmetleri Yönetmeliği çerçevesinde denetlenmesini ve tarafıma resmi bir bilgilendirme yapılmasını arz ederim."

> **Hatırlatma:** BTK şikayeti öncesinde firmanın kendi kanalları üzerinden en az bir kez şikayet kaydı oluşturmuş olmanız, BTK başvurusunun geçerliliği açısından önem arz etmektedir."""
    },
    {
        "id": "teslim-hatasi",
        "title": "Sistemsel Teslimat Hataları",
        "short_description": "Kargonun teslim edildi görünmesine rağmen pakete ulaşılamaması durumunda yapılması gerekenler.",
        "icon": "x-circle",
        "order": 7,
        "content": """## Durum Analizi: Neden Teslim Edildi Görünür?

Sistemde paketinizin teslim edildiği bildirilmiş ancak tarafınıza ulaşmamışsa, bu durum genellikle şu operasyonel nedenlerden kaynaklanmaktadır:

- **Sistemsel Hatalar:** Kuryenin iş yükünü azaltmak amacıyla paketi sehven teslim edildi olarak işaretlemesi.
- **Adres Karışıklığı:** Paketin farklı veya yanlış bir adrese teslim edilmiş olması ihtimali.
- **Operasyonel Kayıp:** Paketin kaybolması ancak sistemde sürecin sonlandırılması.

## Adım Adım Çözüm Prosedürü

1. **Şube İletişimi:** İlk etapta ilgili şubeyi arayarak veya şubeye giderek paketin akıbeti hakkında bilgi alın. Sorunun çözülmesi için makul bir süre tanıyın.
2. **Bölge Müdürlüğü:** Şube düzeyinde çözüm sağlanamazsa, durumu kargo şirketinin Bölge Müdürlüğü'ne yazılı şikayet talebi olarak iletin.
3. **E-Ticaret Bildirimi:** Gönderi bir e-ticaret sitesinden gelmişse, süreci mutlaka alışveriş yapılan platforma bildirin ve talebinizi kayıt altına alın.

> **Kritik Hatırlatma:** Kargo şubeleri yüksek iş yükü nedeniyle bu tarz süreçleri "zaman aşımına" uğratabilir veya takibini unutabilir. Kullanıcı olarak sürecin sonuçlandığını görene kadar takibi elden bırakmamalısınız."""
    },
    {
        "id": "iade-zaman",
        "title": "İade Kargolarında Zaman Yönetimi",
        "short_description": "14 günlük yasal iade süresini korumak için dikkat edilmesi gereken operasyonel detaylar.",
        "icon": "clock",
        "order": 8,
        "content": """## ⚠️ Kritik Uyarı: Kurye Beklemek Risk Taşır!

E-ticaret iadelerinde 14 günlük yasal süre, ürünün kargoya verilmesiyle kesilir. Kargo firmalarının iş yükü, personel eksikliği veya dağıtım önceliği gibi nedenlerle kuryelerin iade alımına gelmemesi sık karşılaşılan bir durumdur.

## Kurye Çağırma Yerine Şubeye Teslimat

Kargo şirketleri operasyonel olarak "teslimat" odaklı çalışır; kapıdan iade alımı (alıp gelme) işlemleri her zaman ikincil plandadır. Bu nedenle iade sürenizin dolmasına az bir zaman kaldıysa şu adımları izlemelisiniz:

1. **Bireysel Teslimat:** Kuryenin gelmesini beklemek yerine, iade kodunuzla birlikte paketi doğrudan en yakın kargo şubesine kendiniz teslim edin.
2. **Gönderi Fişi:** Şubeye teslimat yaptıktan sonra mutlaka iade takip numarasını içeren gönderi fişini (veya barkod çıktısını) alın. Bu fiş, süresi içinde iade yaptığınızın tek yasal ispatıdır.
3. **Personel Eksikliği Faktörü:** Şubelerin kurye personeli eksikliği nedeniyle iade taleplerini erteleme hakkı operasyonel olarak mevcuttur. Mağduriyet yaşamamak adına "kapıdan alım" hizmetine güvenerek son güne bırakılmamalıdır.

> **Sonuç:** Yasal iade süresinin aşılması durumunda "kurye gelmedi" savunması, satıcı firmalar veya Hakem Heyetleri nezdinde ispatı zor bir gerekçedir. Sorumluluk tüketicidedir."""
    },
    {
        "id": "barkod-dusen",
        "title": "Barkodu Düşen Kargo: Kimliksiz Paketler",
        "short_description": "Aktarma merkezlerinde barkodu düşen veya hasar alan gönderilerin izlediği zorlu yol.",
        "icon": "tag",
        "order": 9,
        "content": """## Bir Kargonun Tek Kimliği Barkodudur

Kargo sisteminde paketler isimle değil, barkod numarasıyla yol alır. Eğer taşıma sırasında barkod düşerse, kargo dilsiz kalır. Hangi şubeye gideceği, kimin gönderdiği ve kime teslim edileceği sistemsel olarak imkansız hale gelir.

## Aktarma Merkezlerindeki Görünmez Kahramanlar: Hasar Kayıp Birimi

Kargonuz aktarma merkezinde takılı kaldıysa, bu durum paketinizin "Hasar Kayıp Bölümü"ne alındığı anlamına gelebilir. Burada görev yapan personelin tek bir misyonu vardır:

- **🔍 Barkod Tespiti:** Barkodu düşmüş kargoların içeriğinden, koli yapısından veya şubelerden gelen "kayıp" ihbarlarından yola çıkarak kimlik eşleştirmesi yaparlar.
- **📦 Yeniden Kimliklendirme:** Kimliği tespit edilen kargolar yeniden barkodlanarak ait olduğu şubeye sevk edilir.
- **⚠️ Müşteri Memnuniyeti:** Hiçbir kargo şirketi kargoyu "kaybetmek" istemez. Kayıp kargo demek; tazminat, masraf ve prestij kaybı demektir.

## "Kargom Çalındı mı?" Şüphesine Gerçekçi Bakış

Aktarma merkezleri 7/24 yüksek çözünürlüklü kameralarla izlenir. Personelin bu denli sıkı denetim altında bir kargoyu çalması neredeyse imkansızdır. Eğer kargonuz bir yerde takıldıysa, hırsızlıktan ziyade üzerine ağır bir koli gelmesi sonucu barkodun yırtılması veya düşmesi en büyük ihtimaldir.

> **Tüketiciye Tavsiye:** Kargonuz takılı kaldığında şubeye kargonun dış görünüşünü, koli tipini ve varsa üzerindeki ayırt edici işaretleri detaylıca tarif edin. Bu bilgiler "Hasar Kayıp Personeli"nin eşleştirme yapmasını %90 kolaylaştıracaktır."""
    },
    {
        "id": "guvenli-paketleme",
        "title": "Güvenli Paketleme ve Teknik Esaslar",
        "short_description": "Lojistik operasyonların fiziksel gerçeklerine uygun paketleme yöntemleri.",
        "icon": "box",
        "order": 10,
        "content": """## Lojistik Gerçekler: Paketinizin Yolculuğu

Her gönderi sahibi için kendi kargosu özeldir; ancak unutulmamalıdır ki lojistik operasyonlarda tüm kargolar eşittir ve aynı koşullarda yolculuk yapar. Paketiniz aktarma merkezleri arasında seyahat ederken şu fiziksel şartlara maruz kalır:

- Binlerce farklı ağırlık ve boyuttaki kargo ile aynı kamyon içerisinde taşınır.
- Taşıma sırasında üzerine çok daha ağır veya sivri köşeli bir başka gönderi denk gelebilir.
- Kamyon sarsıntısı, ani frenleme ve merkezkaç kuvveti gibi fiziksel unsurlar paket içerisindeki ürünün yer değiştirmesine neden olur.

> "Kargomun üzerinde 'Kırılacak Eşya' yazıyor" düşüncesi, bu fiziksel baskılara karşı bir koruma kalkanı değildir. Paketleme, bu dış etkenlerin tamamı hesap edilerek yapılmalıdır.

## ✅ Paketleme Püf Noktaları

- **Çift Oluklu Koli:** Kamyon içi baskılara dayanması için mukavemeti yüksek koliler tercih edilmelidir.
- **Tamponlama:** Ürünün koli çeperine teması kesilmeli, sarsıntılara karşı iç dolgu malzemesi (balonlu naylon, köpük) bol tutulmalıdır.

## ❌ Sık Yapılan Paketleme Hataları

- **Eski Koli Kullanımı:** Mukavemeti bitmiş, yumuşamış kolilerin üzerine yük binince ezilmesi kaçınılmazdır.
- **Boşluk Bırakmak:** Koli içindeki boşluklar, üst üste dizilim sırasında kolinin çökmesine neden olur.

> **Tazminat Notu:** Kargo firmaları, yukarıdaki lojistik şartları (sarsıntı, üst üste istifleme) standart kabul eder. Bu şartlara uygun paketlenmeyen ürünlerde hasar sorumluluğu göndericiye aittir."""
    },
    {
        "id": "yasakli-gonderiler",
        "title": "Taşınması Yasaklı Gönderiler ve Yasal Sorumluluklar",
        "short_description": "Lojistik ağında taşınması yasal olarak engellenmiş maddeler ve oluşabilecek hak kayıpları.",
        "icon": "slash",
        "order": 11,
        "content": """## 🚫 ÖNEMLİ: TAZMİNAT HAKKININ KAYBI

Taşınması yasaklı veya kısıtlı olduğu halde gönderilen kargoların hasar alması, kırılması veya kaybolması durumunda kullanıcı hiçbir hak talep edemez.

Bu tür gönderilerde kargo firmasının tazminat sorumluluğu yasal olarak ortadan kalkmaktadır. Gönderici, yasaklı maddeyi kargo sistemine dahil ederek taşıma sözleşmesini tek taraflı olarak ihlal etmiş sayılır.

## 🔥 Yanıcı ve Kimyasal

- Benzin, tiner, alkol, parfümeri ürünleri.
- Basınçlı spreyler ve gaz içeren tüpler.
- Lityum piller ve aküler.

## 💎 Kıymetli Gönderiler

- Nakit para, ziynet eşyası, altın.
- Çek, senet, kıymetli evraklar.
- Pasaport ve resmi kimlik belgeleri.

## 📦 Hassas ve Diğer

- Canlı hayvan ve bitkiler.
- Çabuk bozulabilecek gıdalar.
- Sıvı sızıntısı yapabilecek tüm maddeler.

> **Genişletilmiş Sorumluluk:** Yasaklı bir ürünün (örneğin akma yapan bir sıvının) kargo aracındaki diğer gönderilere veya kargo personeline zarar vermesi durumunda, oluşan tüm maddi ve manevi zararların tazmini yasal yollarla göndericiden talep edilir. Yasaklı gönderi yapmak sadece tazminat hakkını bitirmez, sizi borçlu konuma düşürebilir."""
    }
]

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Kargolojik API - Kargo Sorunları Çözüm Platformu"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kargolojik-api"}

# ---- Branch Routes ----

@api_router.get("/branches", response_model=BranchSearchResponse)
async def get_branches(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    city: Optional[str] = None,
    company: Optional[str] = None
):
    """Get branches with pagination and optional filtering
    
    Search supports multiple words in any order:
    - "aras kargo milas" and "milas aras kargo" return the same results
    - Each word is searched across name, address, city, district, and company fields
    """
    query = {}
    
    if search:
        # Split search into individual words and create AND condition for all words
        words = search.strip().split()
        if len(words) > 1:
            # Multiple words: each word must match in any field (AND logic)
            word_conditions = []
            for word in words:
                word_regex = {"$regex": word, "$options": "i"}
                word_conditions.append({
                    "$or": [
                        {"name": word_regex},
                        {"address": word_regex},
                        {"city": word_regex},
                        {"district": word_regex},
                        {"company": word_regex}
                    ]
                })
            query["$and"] = word_conditions
        else:
            # Single word: search across all fields
            search_regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"name": search_regex},
                {"address": search_regex},
                {"city": search_regex},
                {"district": search_regex},
                {"company": search_regex}
            ]
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    if company:
        query["company"] = {"$regex": company, "$options": "i"}
    
    skip = (page - 1) * limit
    
    total = await db.branches.count_documents(query)
    branches_cursor = db.branches.find(query).skip(skip).limit(limit)
    branches = await branches_cursor.to_list(length=limit)
    
    return BranchSearchResponse(
        branches=[Branch(**{**b, "id": str(b.get("_id", b.get("id")))}) for b in branches],
        total=total,
        page=page,
        limit=limit
    )

@api_router.get("/branches/{branch_id}")
async def get_branch(branch_id: str):
    """Get a specific branch by ID"""
    from bson import ObjectId
    
    try:
        branch = await db.branches.find_one({"_id": ObjectId(branch_id)})
    except:
        branch = await db.branches.find_one({"id": branch_id})
    
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    return Branch(**{**branch, "id": str(branch.get("_id", branch.get("id")))})

@api_router.get("/companies")
async def get_companies():
    """Get list of all cargo companies"""
    companies = await db.branches.distinct("company")
    return {"companies": sorted([c for c in companies if c])}

@api_router.get("/cities")
async def get_cities():
    """Get list of all cities with branches"""
    cities = await db.branches.distinct("city")
    return {"cities": sorted([c for c in cities if c])}

# ---- Help Topics Routes ----

@api_router.get("/help-topics")
async def get_help_topics():
    """Get all help topics"""
    # Check if topics exist in DB, if not seed them
    count = await db.help_topics.count_documents({})
    if count == 0:
        # Seed help topics
        for topic in HELP_TOPICS_DATA:
            await db.help_topics.update_one(
                {"id": topic["id"]},
                {"$set": topic},
                upsert=True
            )
    
    topics = await db.help_topics.find().sort("order", 1).to_list(100)
    return {
        "topics": [
            {
                "id": t["id"],
                "title": t["title"],
                "short_description": t["short_description"],
                "icon": t.get("icon", "help-circle")
            }
            for t in topics
        ]
    }

@api_router.get("/help-topics/{topic_id}")
async def get_help_topic(topic_id: str):
    """Get a specific help topic by ID"""
    topic = await db.help_topics.find_one({"id": topic_id})
    
    if not topic:
        # Try to find from static data
        for t in HELP_TOPICS_DATA:
            if t["id"] == topic_id:
                return t
        raise HTTPException(status_code=404, detail="Help topic not found")
    
    return {
        "id": topic["id"],
        "title": topic["title"],
        "short_description": topic["short_description"],
        "content": topic["content"],
        "icon": topic.get("icon", "help-circle")
    }

# ---- Scraper Routes ----

@api_router.post("/scrape/branches")
async def scrape_branches(sitemap_index: int = Query(1, ge=1, le=7)):
    """Scrape branches from kargolojik.com sitemaps"""
    sitemap_url = f"https://kargolojik.com/post-sitemap{sitemap_index}.xml"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(sitemap_url)
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.text)
            
            # Extract URLs from sitemap
            urls = []
            for url_elem in root.iter():
                if url_elem.tag.endswith('loc'):
                    url = url_elem.text
                    # Filter only branch URLs (containing 'subesi' or 'sube')
                    if url and 'subesi' in url.lower():
                        urls.append(url)
            
            return {
                "message": f"Found {len(urls)} branch URLs in sitemap {sitemap_index}",
                "sitemap_url": sitemap_url,
                "url_count": len(urls),
                "sample_urls": urls[:10]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape sitemap: {str(e)}")

@api_router.post("/scrape/branch-detail")
async def scrape_branch_detail(url: str):
    """Scrape detailed branch information from a specific URL"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract branch name from h1
            name = ""
            h1 = soup.find('h1')
            if h1:
                name = h1.get_text(strip=True)
            
            # Determine company from name
            company = ""
            company_keywords = ['PTT', 'Yurtiçi', 'Aras', 'MNG', 'Sürat', 'UPS', 'DHL', 'FedEx', 'TNT', 'Inter Global']
            name_lower = name.lower()
            for kw in company_keywords:
                if kw.lower() in name_lower:
                    company = kw
                    break
            
            # Extract location
            city = ""
            district = ""
            location_match = re.search(r'📍.*?Konum:?\s*([^/]+)/\s*(.+)', response.text)
            if location_match:
                city = location_match.group(1).strip()
                district = location_match.group(2).strip()
            
            # Extract address
            address = ""
            address_match = re.search(r'🏠.*?Adres:?\s*(.+?)(?=📞|<)', response.text, re.DOTALL)
            if address_match:
                address = address_match.group(1).strip()
                address = re.sub(r'<[^>]+>', '', address).strip()
            
            # Extract phone
            phone = ""
            phone_match = re.search(r'📞.*?Telefon:?\s*([0-9\s\-/]+)', response.text)
            if phone_match:
                phone = phone_match.group(1).strip()
            
            # Extract Google Maps URL
            google_maps_url = ""
            maps_link = soup.find('a', href=lambda h: h and 'google.com/maps' in h)
            if maps_link:
                google_maps_url = maps_link['href']
            
            # Extract logo URL
            logo_url = ""
            logo_img = soup.find('img', src=lambda s: s and 'logo' in s.lower())
            if logo_img:
                logo_url = logo_img['src']
            
            branch_data = {
                "name": name,
                "company": company,
                "city": city,
                "district": district,
                "address": address,
                "phone": phone,
                "google_maps_url": google_maps_url,
                "logo_url": logo_url,
                "source_url": url
            }
            
            # Save to database
            result = await db.branches.update_one(
                {"source_url": url},
                {"$set": {**branch_data, "id": str(uuid.uuid4())}},
                upsert=True
            )
            
            return {
                "message": "Branch scraped successfully",
                "branch": branch_data,
                "upserted": result.upserted_id is not None
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape branch: {str(e)}")

@api_router.post("/seed/sample-branches")
async def seed_sample_branches():
    """Seed database with sample branch data for testing"""
    sample_branches = [
        {
            "id": str(uuid.uuid4()),
            "name": "PTT Kargo Kadıköy Şubesi",
            "company": "PTT Kargo",
            "city": "İstanbul",
            "district": "Kadıköy",
            "address": "Caferağa Mah. Moda Cad. No: 45",
            "phone": "0 216 346 1234",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=PTT+Kargo+Kadikoy",
            "logo_url": "https://kargolojik.com/wp-content/uploads/2026/01/ptt-kargo-logo-png_seeklogo-113537.png",
            "working_hours": {"weekdays": "08:30-17:00", "saturday": "Kapalı", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yurtiçi Kargo Beşiktaş Şubesi",
            "company": "Yurtiçi Kargo",
            "city": "İstanbul",
            "district": "Beşiktaş",
            "address": "Sinanpaşa Mah. Ortabahçe Cad. No: 12",
            "phone": "0 212 259 5678",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Yurtici+Kargo+Besiktas",
            "logo_url": "",
            "working_hours": {"weekdays": "09:00-18:00", "saturday": "09:00-13:00", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Aras Kargo Ankara Çankaya Şubesi",
            "company": "Aras Kargo",
            "city": "Ankara",
            "district": "Çankaya",
            "address": "Kızılay Mah. Atatürk Bulvarı No: 89",
            "phone": "0 312 425 9012",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Aras+Kargo+Cankaya",
            "logo_url": "",
            "working_hours": {"weekdays": "08:30-18:00", "saturday": "09:00-14:00", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "MNG Kargo İzmir Konak Şubesi",
            "company": "MNG Kargo",
            "city": "İzmir",
            "district": "Konak",
            "address": "Alsancak Mah. Kıbrıs Şehitleri Cad. No: 34",
            "phone": "0 232 464 3456",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=MNG+Kargo+Konak",
            "logo_url": "",
            "working_hours": {"weekdays": "09:00-18:00", "saturday": "Kapalı", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sürat Kargo Antalya Merkez Şubesi",
            "company": "Sürat Kargo",
            "city": "Antalya",
            "district": "Muratpaşa",
            "address": "Şirinyalı Mah. Lara Cad. No: 56",
            "phone": "0 242 316 7890",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Surat+Kargo+Antalya",
            "logo_url": "",
            "working_hours": {"weekdays": "08:30-17:30", "saturday": "09:00-13:00", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "PTT Kargo Bursa Osmangazi Şubesi",
            "company": "PTT Kargo",
            "city": "Bursa",
            "district": "Osmangazi",
            "address": "Heykel Mah. Atatürk Cad. No: 78",
            "phone": "0 224 223 4567",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=PTT+Kargo+Osmangazi",
            "logo_url": "https://kargolojik.com/wp-content/uploads/2026/01/ptt-kargo-logo-png_seeklogo-113537.png",
            "working_hours": {"weekdays": "08:30-17:00", "saturday": "Kapalı", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yurtiçi Kargo Adana Seyhan Şubesi",
            "company": "Yurtiçi Kargo",
            "city": "Adana",
            "district": "Seyhan",
            "address": "Reşatbey Mah. Atatürk Cad. No: 123",
            "phone": "0 322 458 9012",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Yurtici+Kargo+Seyhan",
            "logo_url": "",
            "working_hours": {"weekdays": "09:00-18:00", "saturday": "09:00-13:00", "sunday": "Kapalı"}
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Aras Kargo Trabzon Merkez Şubesi",
            "company": "Aras Kargo",
            "city": "Trabzon",
            "district": "Ortahisar",
            "address": "Kemerkaya Mah. Maraş Cad. No: 45",
            "phone": "0 462 321 5678",
            "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Aras+Kargo+Trabzon",
            "logo_url": "",
            "working_hours": {"weekdays": "08:30-18:00", "saturday": "09:00-14:00", "sunday": "Kapalı"}
        }
    ]
    
    inserted_count = 0
    for branch in sample_branches:
        result = await db.branches.update_one(
            {"name": branch["name"]},
            {"$set": branch},
            upsert=True
        )
        if result.upserted_id:
            inserted_count += 1
    
    return {
        "message": f"Seeded {inserted_count} new branches, {len(sample_branches) - inserted_count} already existed",
        "total_branches": await db.branches.count_documents({})
    }

@api_router.get("/stats")
async def get_stats():
    """Get database statistics"""
    branch_count = await db.branches.count_documents({})
    topic_count = await db.help_topics.count_documents({})
    companies = await db.branches.distinct("company")
    cities = await db.branches.distinct("city")
    
    return {
        "branches": branch_count,
        "help_topics": topic_count if topic_count > 0 else len(HELP_TOPICS_DATA),
        "companies": len([c for c in companies if c]),
        "cities": len([c for c in cities if c])
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
