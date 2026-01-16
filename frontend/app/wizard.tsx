import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WizardStep {
  id: string;
  question: string;
  options: {
    label: string;
    nextStep?: string;
    result?: string;
  }[];
}

const WIZARD_STEPS: Record<string, WizardStep> = {
  main: {
    id: 'main',
    question: 'Ne tür bir sorun yaşıyorsunuz?',
    options: [
      { label: 'Kargom Kayboldu', nextStep: 'kayip' },
      { label: 'Kargom Gecikti', nextStep: 'gecikme' },
      { label: 'Kargom Hasarlı Geldi', nextStep: 'hasar' },
      { label: 'Dolandırıldım / Farklı Ürün', nextStep: 'dolandiricilik' },
      { label: 'İade Sorunu', nextStep: 'iade' },
      { label: 'Şube ile İletişim Sorunu', nextStep: 'iletisim' },
    ],
  },
  kayip: {
    id: 'kayip',
    question: 'Kargonuz nerede takılı görünüyor?',
    options: [
      { label: 'Kargo Şubede Kayboldu', nextStep: 'kayip_sube' },
      { label: 'Aktarma Merkezinde Kayboldu', nextStep: 'kayip_aktarma' },
      { label: 'Kurye Teslim Etti Deniyor Ama Almadım', nextStep: 'kayip_teslim' },
      { label: 'Takip Bilgisi Güncellenmiyor', nextStep: 'kayip_takip' },
    ],
  },
  kayip_sube: {
    id: 'kayip_sube',
    question: '',
    options: [],
  },
  kayip_aktarma: {
    id: 'kayip_aktarma',
    question: '',
    options: [],
  },
  kayip_teslim: {
    id: 'kayip_teslim',
    question: '',
    options: [],
  },
  kayip_takip: {
    id: 'kayip_takip',
    question: '',
    options: [],
  },
  gecikme: {
    id: 'gecikme',
    question: 'Kargonuz kaç gündür gecikiyor?',
    options: [
      { label: '1-3 Gün', nextStep: 'gecikme_kisa' },
      { label: '4-7 Gün', nextStep: 'gecikme_orta' },
      { label: '7 Günden Fazla', nextStep: 'gecikme_uzun' },
    ],
  },
  gecikme_kisa: {
    id: 'gecikme_kisa',
    question: '',
    options: [],
  },
  gecikme_orta: {
    id: 'gecikme_orta',
    question: '',
    options: [],
  },
  gecikme_uzun: {
    id: 'gecikme_uzun',
    question: '',
    options: [],
  },
  hasar: {
    id: 'hasar',
    question: 'Hasar durumunuz nedir?',
    options: [
      { label: 'Dış Ambalaj Hasarlı', nextStep: 'hasar_dis' },
      { label: 'İç Ürün Hasarlı (Dış Sağlam)', nextStep: 'hasar_ic' },
      { label: 'Hasar Tespit Tutanağım Var', nextStep: 'hasar_tutanak_var' },
      { label: 'Tutanak Tutturmadım', nextStep: 'hasar_tutanak_yok' },
    ],
  },
  hasar_dis: {
    id: 'hasar_dis',
    question: '',
    options: [],
  },
  hasar_ic: {
    id: 'hasar_ic',
    question: '',
    options: [],
  },
  hasar_tutanak_var: {
    id: 'hasar_tutanak_var',
    question: '',
    options: [],
  },
  hasar_tutanak_yok: {
    id: 'hasar_tutanak_yok',
    question: '',
    options: [],
  },
  dolandiricilik: {
    id: 'dolandiricilik',
    question: 'Durumunuzu seçin:',
    options: [
      { label: 'Farklı Ürün Geldi', nextStep: 'dolandiricilik_farkli' },
      { label: 'Boş Kutu Geldi', nextStep: 'dolandiricilik_bos' },
      { label: 'Sahte/Taklit Ürün', nextStep: 'dolandiricilik_sahte' },
    ],
  },
  dolandiricilik_farkli: {
    id: 'dolandiricilik_farkli',
    question: '',
    options: [],
  },
  dolandiricilik_bos: {
    id: 'dolandiricilik_bos',
    question: '',
    options: [],
  },
  dolandiricilik_sahte: {
    id: 'dolandiricilik_sahte',
    question: '',
    options: [],
  },
  iade: {
    id: 'iade',
    question: 'İade sorununuz nedir?',
    options: [
      { label: 'Kurye Almaya Gelmiyor', nextStep: 'iade_kurye' },
      { label: 'İade Süresi Dolmak Üzere', nextStep: 'iade_sure' },
      { label: 'İade Kargom Kayboldu', nextStep: 'iade_kayip' },
    ],
  },
  iade_kurye: {
    id: 'iade_kurye',
    question: '',
    options: [],
  },
  iade_sure: {
    id: 'iade_sure',
    question: '',
    options: [],
  },
  iade_kayip: {
    id: 'iade_kayip',
    question: '',
    options: [],
  },
  iletisim: {
    id: 'iletisim',
    question: 'İletişim sorununuz nedir?',
    options: [
      { label: 'Şube Telefona Cevap Vermiyor', nextStep: 'iletisim_telefon' },
      { label: 'Şube Kaba Davrandı', nextStep: 'iletisim_kaba' },
      { label: 'Şube Yardımcı Olmuyor', nextStep: 'iletisim_yardim' },
    ],
  },
  iletisim_telefon: {
    id: 'iletisim_telefon',
    question: '',
    options: [],
  },
  iletisim_kaba: {
    id: 'iletisim_kaba',
    question: '',
    options: [],
  },
  iletisim_yardim: {
    id: 'iletisim_yardim',
    question: '',
    options: [],
  },
};

const RESULTS: Record<string, { title: string; content: string }> = {
  kayip_sube: {
    title: 'Çözüm: Şube Kaybı',
    content: `Şube ile iletişime geçip 'Tazmin Süreci' başlatmalısınız. Eğer şube ilgilenmezse Bölge Müdürlüğü'ne dilekçe verin.

**Adım Adım Yapılması Gerekenler:**
1. Şubeye giderek kayıp bildiriminde bulunun
2. Şube kamerasının incelenmesini talep edin
3. Yazılı başvuru yapın ve bir kopyasını alın
4. Sonuç alamazsanız Bölge Müdürlüğü'ne başvurun
5. Gerekirse BTK'ya şikayet edin`,
  },
  kayip_aktarma: {
    title: 'Çözüm: Aktarma Kaybı',
    content: `Aktarma merkezindeki kayıplar genellikle barkod düşmesi kaynaklıdır.

**Yapılması Gerekenler:**
1. Şubeye giderek 'Eşkal Bildirimi' yapın (paketin dış görünüşü, rengi, boyutu)
2. Şubeden Aktarma Merkezine 'Kayıp Araştırma Maili' atmasını isteyin
3. BTK üzerinden şikayet oluşturmak süreci hızlandırır
4. Sabırlı olun - barkodu düşen kargolar Hasar Kayıp biriminde sahiplerini bekliyor olabilir`,
  },
  kayip_teslim: {
    title: 'Çözüm: Teslim Edildi Görünüyor Ama Almadım',
    content: `Sistemde "teslim edildi" görünmesine rağmen pakete ulaşamadınız.

**Yapılması Gerekenler:**
1. Derhal şubeyi arayın veya şubeye gidin
2. Kuryenin GPS kaydını ve teslimat fotoğrafını isteyin
3. Komşularınıza sorun - yanlış adrese bırakılmış olabilir
4. E-ticaret siparişiyse platforma "teslim edilmedi" bildirimi yapın
5. Şubeden yazılı yanıt alın
6. Çözüm olmazsa BTK'ya şikayet edin`,
  },
  kayip_takip: {
    title: 'Çözüm: Takip Bilgisi Güncellenmiyor',
    content: `Kargo takip bilgisi uzun süredir güncellenmiyorsa:

**Yapılması Gerekenler:**
1. 3 günden fazla güncelleme yoksa şubeyi arayın
2. Kargonun son görüldüğü lokasyonu öğrenin
3. Şubeden Aktarma Merkezine sordurtun
4. 7 günü geçtiyse BTK'ya "gönderi akıbetinin belirsizliği" ile başvurun`,
  },
  gecikme_kisa: {
    title: 'Bilgi: 1-3 Günlük Gecikme',
    content: `1-3 günlük gecikmeler genellikle normaldir.

**Olası Sebepler:**
- Hafta sonu/resmi tatil
- Yoğun sezon (kampanya dönemleri)
- Hava koşulları
- Adres tespit zorluğu

**Önerimiz:**
- Sabırlı olun, takibi kontrol etmeye devam edin
- 3 günü geçerse şubeyi arayın`,
  },
  gecikme_orta: {
    title: 'Çözüm: 4-7 Günlük Gecikme',
    content: `Bu süre kabul edilebilir sınırların üzerindedir.

**Yapılması Gerekenler:**
1. Şubeyi arayarak durumu sorun
2. Kargonun tam olarak nerede olduğunu öğrenin
3. Tahmini teslimat tarihi alın
4. E-ticaret siparişiyse satıcıya bildirin
5. Şube ilgilenmezse Bölge Müdürlüğü'ne başvurun`,
  },
  gecikme_uzun: {
    title: 'Çözüm: 7+ Günlük Gecikme',
    content: `7 günü aşan gecikmeler ciddi bir sorundur.

**Acil Yapılması Gerekenler:**
1. Şubeye yazılı başvuru yapın
2. Bölge Müdürlüğü'ne şikayet edin
3. e-Devlet üzerinden BTK'ya başvurun
4. E-ticaret siparişiyse platformdan iade/iptal talep edin

**BTK Başvuru Metninizde Şunları Belirtin:**
- "Gönderi akıbetinin belirsizliği"
- "Hizmet kusuru"
- "Taahhüt edilen teslimat süresinin aşılması"`,
  },
  hasar_dis: {
    title: 'Çözüm: Dış Ambalaj Hasarlı',
    content: `Dış ambalajda hasar varsa:

**KESİNLİKLE YAPMAYIN:**
❌ Paketi teslim almayın!

**YAPMANIZ GEREKENLER:**
1. Kuryeye paketi iade edin
2. "Hasarlı geldi, teslim almıyorum" deyin
3. Paketin şubeye geri dönmesini bekleyin
4. Şubede "Hasar Tespit Tutanağı" düzenlettirin
5. Tutanak olmadan hiçbir hak talep edemezsiniz`,
  },
  hasar_ic: {
    title: 'Çözüm: Gizli Hasar (İç Ürün Hasarlı)',
    content: `Dış ambalaj sağlam ama içerideki ürün hasarlı:

**Yapılması Gerekenler:**
1. Hemen ürünün fotoğraflarını çekin
2. Ambalajın fotoğraflarını da çekin
3. E-ticaret alışverişiyse:
   - Platformdan "İade Talebi" başlatın
   - Muhatabınız satıcıdır, kargo şirketi değil
4. Bireysel gönderiyse:
   - Fatura ile şubeye gidin
   - "Tazmin Dilekçesi" verin

⚠️ Faturasız ürünlerde tazminat talep edemezsiniz!`,
  },
  hasar_tutanak_var: {
    title: 'Çözüm: Tutanak Var',
    content: `Hasar Tespit Tutanağınız varsa güçlü konumdasınız.

**Sonraki Adımlar:**
1. Tutanak ve fatura ile tazmin başvurusu yapın
2. Kargo firmasının değerlendirmesini bekleyin
3. Red cevabı alırsanız:
   - Tüketici Hakem Heyeti'ne başvurun
   - Gerekirse hukuki yollara başvurun

**Tazminat Kriterleri:**
- Fatura değeri baz alınır
- Firma piyasa rayici araştırması yapabilir
- Yüksek tutarlı gönderilerde kısmi ödeme olabilir`,
  },
  hasar_tutanak_yok: {
    title: 'Uyarı: Tutanak Yok',
    content: `Tutanak olmadan hak arama zorlaşır ama imkansız değildir.

**Acil Yapılması Gerekenler:**
1. Hemen paketin fotoğraflarını çekin
2. Varsa video çekin
3. Şubeye giderek "Durum Tespit Tutanağı" talep edin
4. Olumsuz yanıt alırsanız:
   - Dilekçeyle yazılı başvurun
   - Tüketici Hakem Heyeti'ne başvurun

**Önemli:** Kurye gittikten sonra hasarı ispatlamak zordur. Tutanak olmadan tazminat alma şansınız düşüktür.`,
  },
  dolandiricilik_farkli: {
    title: 'Çözüm: Farklı Ürün Geldi',
    content: `Sipariş ettiğinizden farklı ürün geldiyse:

**Yapılması Gerekenler:**
1. Paketi açar açmaz fotoğraf çekin
2. E-ticaret platformunda "İade Talebi" açın
3. Satıcıya "Yanlış ürün gönderildi" bildirin
4. Kargo fişini ve faturayı saklayın
5. Satıcı çözüm sunmazsa:
   - Platform müşteri hizmetlerine başvurun
   - Tüketici Hakem Heyeti'ne şikayet edin`,
  },
  dolandiricilik_bos: {
    title: 'Çözüm: Boş Kutu Geldi',
    content: `Boş kutu geldiyse ciddi bir durumdur.

**Acil Yapılması Gerekenler:**
1. Kutuyu açma anını ve içini video çekin
2. Şubeye gidin, "Eksik İçerik" bildirimi yapın
3. Aktarma Merkezine "Kayıp Araştırma" başlatın
4. E-ticaret platformuna şikayet edin
5. BTK'ya başvurun
6. Tutarı yüksekse polise şikayetçi olun`,
  },
  dolandiricilik_sahte: {
    title: 'Çözüm: Sahte/Taklit Ürün',
    content: `Sahte veya taklit ürün geldiyse:

**Yapılması Gerekenler:**
1. Ürünün fotoğraflarını çekin
2. Orijinal ürünle karşılaştırmalı fotoğraf çekin
3. E-ticaret platformuna şikayet edin
4. Tüketici Hakem Heyeti'ne başvurun
5. Marka sahibine de bildirimde bulunabilirsiniz

**Uyarı:** Sahte ürün satışı suçtur. Gerekirse savcılığa suç duyurusunda bulunabilirsiniz.`,
  },
  iade_kurye: {
    title: 'Çözüm: Kurye Almaya Gelmiyor',
    content: `Kargo firmaları "teslimat" odaklı çalışır, iade alımı ikinci plandadır.

**Yapılması Gerekenler:**
1. İade sürenizi kontrol edin (genellikle 14 gün)
2. Süreniz azsa: Paketi kendiniz en yakın şubeye götürün
3. İade kodunuzla birlikte teslim edin
4. Mutlaka "Gönderi Fişi" alın - bu sizin ispat belgenizdir

**Uyarı:** "Kurye gelmedi" savunması, süre aşımında geçerli bir mazeret değildir. Sorumluluk tüketicidedir.`,
  },
  iade_sure: {
    title: 'ACİL: İade Süresi Dolmak Üzere',
    content: `İade süreniz dolmak üzereyse acil hareket edin!

**HEMEN YAPIN:**
1. Kurye beklemeyin!
2. Paketi en yakın kargo şubesine götürün
3. İade kodunuzla teslim edin
4. "Gönderi Fişi" mutlaka alın

**Önemli:** Yasal süre, ürünün kargoya verilmesiyle durur. Gönderi fişi aldığınız an süre kesilir.`,
  },
  iade_kayip: {
    title: 'Çözüm: İade Kargom Kayboldu',
    content: `İade gönderiniz kaybolmuşsa:

**Yapılması Gerekenler:**
1. Gönderi fişinizi bulun (takip numarası)
2. Kargo firmasını arayın, durumu sorun
3. Şubeye yazılı başvuru yapın
4. E-ticaret platformuna bildirin
5. Platform size hak verir - çünkü kargolama ispatlıdır

**Önemli:** Gönderi fişi = iade ispatı. Bu olmadan işlem yapmak zorlaşır.`,
  },
  iletisim_telefon: {
    title: 'Çözüm: Şube Telefona Cevap Vermiyor',
    content: `Şubeye ulaşamıyorsanız:

**Alternatif Yollar:**
1. Şubeye bizzat gidin
2. Kargo firmasının merkez müşteri hizmetlerini arayın
3. Firmanın sosyal medya hesaplarından mesaj atın
4. e-Devlet CİMER üzerinden şikayet edin
5. BTK'ya başvurun

**Hatırlatma:** Şubelerin yoğunluğu nedeniyle telefona cevap verememesi yaygındır. Fiziksel ziyaret daha etkilidir.`,
  },
  iletisim_kaba: {
    title: 'Çözüm: Şube Personeli Kaba Davrandı',
    content: `Kötü muamele gördüyseniz:

**Yapılması Gerekenler:**
1. Olayı detaylı not edin (tarih, saat, personel adı)
2. Varsa tanık bilgilerini alın
3. Firmanın müşteri hizmetlerine şikayet edin
4. Bölge Müdürlüğü'ne yazılı şikayet gönderin
5. Sosyal medyada paylaşın (nazik bir dille)

**Önemli:** Personel sirkülasyonu nedeniyle şubeler sürekli yeni personel çalıştırır. Sabırlı olmak önemlidir.`,
  },
  iletisim_yardim: {
    title: 'Çözüm: Şube Yardımcı Olmuyor',
    content: `Şube sorununuzu çözmüyorsa:

**Üst Mercilere Başvuru:**
1. Bölge Müdürlüğü'ne dilekçe yazın
2. Firmanın genel müdürlüğüne şikayet edin
3. BTK'ya e-Devlet üzerinden başvurun
4. Tüketici Hakem Heyeti'ne başvurun

**BTK Başvurusunda Kullanın:**
- "Hizmet kusuru"
- "Bilgi edinme hakkının engellenmesi"
- "Mevzuata aykırılık"`,
  },
};

export default function WizardScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>(['main']);
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentStepId = history[history.length - 1];
  const currentStep = WIZARD_STEPS[currentStepId];
  const result = RESULTS[currentStepId];

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(callback, 150);
  };

  const goToStep = (stepId: string) => {
    animateTransition(() => {
      setHistory([...history, stepId]);
    });
  };

  const goBack = () => {
    if (history.length > 1) {
      animateTransition(() => {
        setHistory(history.slice(0, -1));
      });
    }
  };

  const resetWizard = () => {
    animateTransition(() => {
      setHistory(['main']);
    });
  };

  // Show result if we're at a result step
  if (result) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Ad Placeholder */}
          <View style={styles.adBanner}>
            <Text style={styles.adText}>Reklam Alanı</Text>
          </View>

          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
            <View style={styles.resultIconContainer}>
              <Feather name="check-circle" size={48} color="#10b981" />
            </View>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <View style={styles.resultContent}>
              <Text style={styles.resultText}>{result.content}</Text>
            </View>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Feather name="arrow-left" size={20} color="#64748b" />
              <Text style={styles.backButtonText}>Geri Dön</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={resetWizard}>
              <Feather name="refresh-cw" size={20} color="#ffffff" />
              <Text style={styles.resetButtonText}>Baştan Başla</Text>
            </TouchableOpacity>
          </View>

          {/* Ad Placeholder Bottom */}
          <View style={styles.adBannerBottom}>
            <Text style={styles.adText}>Reklam Alanı</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ad Placeholder */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Adım {history.length}</Text>
          <View style={styles.progressDots}>
            {history.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === history.length - 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <View style={styles.questionIconContainer}>
            <Feather name="help-circle" size={32} color="#1e88e5" />
          </View>
          <Text style={styles.questionText}>{currentStep.question}</Text>
        </Animated.View>

        <Animated.View style={[styles.optionsContainer, { opacity: fadeAnim }]}>
          {currentStep.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => option.nextStep && goToStep(option.nextStep)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
              <Feather name="chevron-right" size={20} color="#1e88e5" />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {history.length > 1 && (
          <TouchableOpacity style={styles.backButtonSmall} onPress={goBack}>
            <Feather name="arrow-left" size={18} color="#64748b" />
            <Text style={styles.backButtonSmallText}>Geri Dön</Text>
          </TouchableOpacity>
        )}

        {/* Ad Placeholder Bottom */}
        <View style={styles.adBannerBottom}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  adBanner: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    minHeight: 60,
  },
  adBannerBottom: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
    minHeight: 80,
  },
  adText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  progressDotActive: {
    backgroundColor: '#1e88e5',
    width: 24,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  optionsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  backButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  backButtonSmallText: {
    fontSize: 15,
    color: '#64748b',
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultIconContainer: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultContent: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    width: '100%',
  },
  resultText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e88e5',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
