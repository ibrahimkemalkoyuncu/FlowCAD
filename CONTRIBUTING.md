# Katkıda Bulunma Rehberi

FlowCAD projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklamaktadır.

## 📋 İçindekiler

- [Başlamadan Önce](#başlamadan-önce)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Standartları](#kod-standartları)
- [Commit Mesajları](#commit-mesajları)
- [Pull Request Süreci](#pull-request-süreci)
- [Test Yazma](#test-yazma)

## Başlamadan Önce

1. Projeyi fork edin
2. Local makinenize clone edin:
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/FlowCAD.git
   cd FlowCAD
   ```

3. Upstream repository'yi ekleyin:
   ```bash
   git remote add upstream https://github.com/ibrahimkemalkoyuncu/FlowCAD.git
   ```

## Geliştirme Ortamı

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

### Backend Kurulumu

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run --project FlowCAD.Api
```

## Kod Standartları

### TypeScript/React

- **ESLint** kurallarına uyun
- **TypeScript** strict mode kullanın
- `any` tipi kullanmaktan kaçının
- Fonksiyonlar için JSDoc yorumları yazın
- Komponent isimleri PascalCase olmalı
- Dosya isimleri component adı ile aynı olmalı

#### Örnek Komponent

```typescript
/**
 * Proje listesi komponenti
 * 
 * @component
 * @param {ProjectListProps} props - Komponent özellikleri
 * @returns {JSX.Element} Proje listesi UI
 */
export const ProjectList: React.FC<ProjectListProps> = ({ onSelect }) => {
  // Implementation
};
```

### C# / .NET

- **Clean Architecture** prensiplerini takip edin
- **SOLID** prensiplerine uyun
- Her metod için XML documentation yazın
- Async/await pattern kullanın
- Dependency Injection kullanın

#### Örnek Controller

```csharp
/// <summary>
/// Proje yönetimi için API controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    /// <summary>
    /// Tüm projeleri getirir
    /// </summary>
    /// <returns>Proje listesi</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        // Implementation
    }
}
```

### CSS/Styling

- **Tailwind CSS** utility classes kullanın
- Custom CSS yazarken component-specific olun
- Responsive tasarım prensiplerini unutmayın

## Commit Mesajları

Conventional Commits formatını kullanın:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type Değerleri

- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod formatı değişiklikleri (white-space, formatting)
- `refactor`: Kod yeniden yapılandırma
- `perf`: Performance iyileştirmesi
- `test`: Test ekleme veya düzeltme
- `chore`: Build process veya auxiliary tools değişiklikleri

### Örnekler

```bash
feat(editor): Add snap to perpendicular feature

Added snap to perpendicular functionality for better pipe alignment.
Includes UI controls and keyboard shortcut (R key).

Closes #123
```

```bash
fix(api): Fix project deletion cascade error

Fixed foreign key constraint error when deleting projects
with associated drawings.

Fixes #456
```

## Pull Request Süreci

1. **Feature Branch Oluşturun**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Değişikliklerinizi Commit Edin**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```

3. **Branch'inizi Push Edin**
   ```bash
   git push origin feature/amazing-feature
   ```

4. **Pull Request Oluşturun**
   - GitHub'da Pull Request oluşturun
   - Açıklayıcı bir başlık ve açıklama yazın
   - İlgili issue'ları referans edin
   - Screenshots ekleyin (UI değişiklikleri için)

### PR Checklist

- [ ] Kod ESLint/StyleCop kurallarına uygun
- [ ] Tüm testler geçiyor
- [ ] Yeni özellikler için testler eklendi
- [ ] Dokümantasyon güncellendi
- [ ] Commit mesajları düzgün formatlanmış
- [ ] Breaking changes belirtildi (varsa)

## Test Yazma

### Frontend Tests (Jest/Vitest)

```typescript
describe('ProjectList', () => {
  it('should render project items', () => {
    const projects = [
      { id: 1, name: 'Test Project' }
    ];
    
    render(<ProjectList projects={projects} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

### Backend Tests (xUnit)

```csharp
public class ProjectServiceTests
{
    [Fact]
    public async Task GetAll_ReturnsAllProjects()
    {
        // Arrange
        var service = new ProjectService();
        
        // Act
        var result = await service.GetAll();
        
        // Assert
        Assert.NotEmpty(result);
    }
}
```

## Kod İnceleme

Pull request'ler en az bir kişi tarafından incelenmelidir. İnceleme kriterleri:

- Kod kalitesi ve okunabilirlik
- Test coverage
- Performance etkileri
- Security implications
- Dokümantasyon yeterliliği

## Sık Sorulan Sorular

### Build hatası alıyorum, ne yapmalıyım?

```bash
# Frontend için
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build

# Backend için
cd backend
dotnet clean
dotnet restore
dotnet build
```

### Migration hatası alıyorum

```bash
cd backend
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## İletişim

- GitHub Issues kullanarak soru sorabilirsiniz
- PR'lar için discussion başlatabilirsiniz
- Email: (gerekirse ekleyin)

## Teşekkürler!

Katkılarınız için teşekkür ederiz! 🎉
