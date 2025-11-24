# 🏗️ FlowCAD - Tesisat Çizim Uygulaması

FlowCAD, modern web teknolojileri kullanılarak geliştirilmiş profesyonel bir tesisat çizim uygulamasıdır. 3D görselleştirme, akıllı snap sistemi ve malzeme hesaplama özellikleri ile tesisat projelerinizi kolayca oluşturun ve yönetin.

## ✨ Özellikler

### 🎨 Çizim Araçları
- **Boru Çizimi**: Farklı çaplarda (1/2" - 2") boru çizimi
- **Cihaz Ekleme**: Vana, sayaç, kombi gibi tesisat elemanları
- **Akıllı Snap Sistemi**: 
  - Uç noktalara yapışma
  - Orta noktalara yapışma  
  - Kesişim noktalarına yapışma
  - Grid'e yapışma
  - Merkez noktalarına yapışma
- **Seçim ve Düzenleme**: Obje seçme, taşıma, silme

### 📐 Proje Yönetimi
- **Proje Oluşturma**: Yeni projeler oluşturun
- **Proje Açma**: Editor içinden doğrudan proje seçimi
- **Proje Kaydetme**: Çalışmanızı kaydedin
- **Proje Listesi**: Tüm projelerinizi görüntüleyin

### 📊 Malzeme Yönetimi
- **Otomatik Malzeme Hesaplama**: Kullanılan boru ve cihazları otomatik hesaplar
- **Excel Export**: Malzeme listesini Excel'e aktarın
- **PDF Export**: Malzeme listesini PDF olarak kaydedin
- **Detaylı Raporlama**: Çap bazında boru uzunlukları ve sayıları

### 🖥️ Klavuz (Blueprint) Desteği
- **DWG/DXF İçe Aktarma**: AutoCAD dosyalarını içe aktarın
- **Görsel Klavuz**: Resim dosyalarını altlık olarak kullanın
- **Katman Yönetimi**: Farklı katmanları göster/gizle
- **Ölçekleme ve Konumlandırma**: Klavuzları özelleştirin

### 🔄 Gelişmiş Özellikler
- **Geri Al/İleri Al**: Sınırsız undo/redo desteği
- **Klavye Kısayolları**: Hızlı çalışma için kısayollar
- **3D Görselleştirme**: Three.js ile gerçekçi 3D render
- **Responsive Tasarım**: Farklı ekran boyutlarında çalışır

## 🚀 Kurulum

### Gereksinimler
- **Frontend**: Node.js 18+ ve npm
- **Backend**: .NET 8.0 SDK
- **Database**: SQL Server veya SQL Server LocalDB

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Frontend http://localhost:5173 adresinde başlayacaktır.

### Backend Kurulumu

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run --project FlowCAD.Api
```

Backend http://localhost:5000 adresinde başlayacaktır.

## 🛠️ Teknoloji Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Three.js & React Three Fiber** - 3D Rendering
- **Zustand** - State Management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **jsPDF & xlsx** - Export Functionality

### Backend
- **ASP.NET Core 8** - Web API Framework
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **AutoMapper** - Object Mapping

## 📖 Kullanım

### Proje Oluşturma
1. Ana sayfada "**+ Yeni Proje**" butonuna tıklayın
2. Editor sayfası açılacaktır
3. Çizim araçlarını kullanarak projenizi oluşturun

### Boru Çizimi
1. Toolbar'dan "**Boru**" aracını seçin (veya **P** tuşu)
2. İstediğiniz çapı seçin
3. Canvas üzerinde başlangıç ve bitiş noktalarını tıklayın
4. Snap sistemi otomatik olarak yakındaki noktalara yapışacaktır

### Cihaz Ekleme
1. Toolbar'dan ilgili cihazı seçin (Vana: **A**, Sayaç: **M**, Kombi: **B**)
2. Canvas üzerinde yerleştirmek istediğiniz noktaya tıklayın

### Snap Sistemi Kullanımı
1. "**🧲 Snap**" butonuna tıklayın veya **S** tuşuna basın
2. İstediğiniz snap türlerini aktif edin:
   - **G**: Grid snap
   - **E**: Endpoint snap
   - **Q**: Midpoint snap
   - **I**: Intersection snap

### Malzeme Listesi
1. "**📋 Malzeme Listesi**" butonuna tıklayın
2. Kullanılan malzemeleri görüntüleyin
3. **Excel** veya **PDF** olarak dışa aktarın

## ⌨️ Klavye Kısayolları

| Kısayol | Fonksiyon |
|---------|-----------|
| **V** | Seçim modu |
| **P** | Boru çizimi |
| **A** | Vana ekleme |
| **M** | Sayaç ekleme |
| **B** | Kombi ekleme |
| **D** | Silme modu |
| **S** | Snap paneli aç/kapat |
| **G** | Grid snap toggle |
| **E** | Endpoint snap toggle |
| **Q** | Midpoint snap toggle |
| **I** | Intersection snap toggle |
| **Esc** | İptal / Seçim modu |
| **Ctrl+Z** | Geri al |
| **Ctrl+Y** | İleri al |
| **Ctrl+N** | Yeni proje |
| **Ctrl+O** | Proje aç |
| **Ctrl+S** | Proje kaydet |

## 📁 Proje Yapısı

```
FlowCAD/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # React Components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Services
│   │   ├── store/           # Zustand State Management
│   │   ├── types/           # TypeScript Types
│   │   └── utils/           # Utility Functions
│   ├── public/              # Static Files
│   └── package.json
│
└── backend/                 # .NET Backend
    ├── FlowCAD.Api/        # Web API Project
    │   ├── Controllers/    # API Controllers
    │   ├── Models/         # Domain Models
    │   ├── Services/       # Business Logic
    │   ├── Data/           # Database Context
    │   └── DTOs/           # Data Transfer Objects
    └── FlowCAD.sln         # Solution File
```

## 🔧 Geliştirme

### Frontend Build
```bash
cd frontend
npm run build        # Production build
npm run lint         # Linting
npm run preview      # Preview production build
```

### Backend Build
```bash
cd backend
dotnet build                    # Build solution
dotnet test                     # Run tests
dotnet ef migrations add <Name> # Add migration
dotnet ef database update       # Update database
```

## 📝 API Endpoints

### Projects
- `GET /api/projects` - Tüm projeleri listele
- `GET /api/projects/{id}` - Proje detayı
- `POST /api/projects` - Yeni proje oluştur
- `PUT /api/projects/{id}` - Proje güncelle
- `DELETE /api/projects/{id}` - Proje sil

### Components
- `GET /api/components` - Tüm bileşenleri listele
- `GET /api/components/{id}` - Bileşen detayı
- `POST /api/components` - Yeni bileşen oluştur

### Materials
- `GET /api/materials` - Malzeme listesi
- `GET /api/materials/calculate` - Malzeme hesaplama

### Blueprints
- `POST /api/blueprint/upload` - Klavuz yükle
- `GET /api/blueprint/{id}` - Klavuz getir
- `DELETE /api/blueprint/{id}` - Klavuz sil

## 🐛 Bilinen Sorunlar ve Çözümler

### Build Hataları
- **Problem**: TypeScript compilation errors
- **Çözüm**: `npm install` ve `npm run build` komutlarını çalıştırın

### Database Connection
- **Problem**: Cannot connect to database
- **Çözüm**: `appsettings.json` dosyasındaki connection string'i kontrol edin

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Ibrahim Kemal Koyuncu** - [@ibrahimkemalkoyuncu](https://github.com/ibrahimkemalkoyuncu)

## 📞 İletişim

Sorularınız veya önerileriniz için issue açabilirsiniz.

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir.
