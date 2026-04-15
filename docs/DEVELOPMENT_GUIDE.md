# Guía de Desarrollo - Resto-Connect

## 🎯 Principios de Desarrollo

### 1. Domain-Driven Design (DDD)
- **La lógica de negocio va en Domain** (`src/domain`)
- Entidades y Value Objects representan conceptos del negocio
- Agregados encapsulan invariantes
- Repositorios son interfaces, no implementaciones

### 2. Arquitectura Hexagonal
- **Dominio**: Lógica pura, sin dependencias técnicas
- **Aplicación**: Orquestación, DTOs, casos de uso
- **Infraestructura**: DB, HTTP, APIs externas
- **Shared**: Utilities comunes

### 3. SOLID Principles
- **S**ingle Responsibility - Una razón para cambiar
- **O**pen/Closed - Abierto extensión, cerrado modificación
- **L**iskov Substitution - Subtipos intercambiables
- **I**nterface Segregation - Interfaces específicas
- **D**ependency Inversion - Depender de abstracciones

## 📝 Convenciones de Código

### Backend

#### Estructura de carpetas
```
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── aggregates/
├── application/
│   ├── use-cases/
│   ├── dtos/
│   └── service/
├── infrastructure/
│   ├── persistence/
│   ├── http/
│   └── external/
└── shared/
```

#### Nombres
```typescript
// Entidades (Entity + PascalCase)
class User extends Entity<UserId> {}

// Value Objects (ValueObject + PascalCase)
class Email extends ValueObject<string> {}

// Interfaces (I + PascalCase)
interface IUserRepository {}

// Use Cases (Acció + UseCase)
class CreateUserUseCase {}

// DTOs (EntityName + Suffix)
class CreateUserDTO {}
class UserResponseDTO {}

// Funciones (camelCase)
function validateEmail(email: string): boolean {}
```

#### Ejemplo: Implementar un Agregado

```typescript
// 1. Value Object
export class UserId extends ValueObject<string> {
  static create(id?: string): UserId {
    return new UserId(id || crypto.randomUUID())
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('UserId must be a valid string')
    }
  }

  equals(vo: UserId): boolean {
    return this.value === vo.value
  }
}

// 2. Entity (Agregado Raíz)
export class User extends Entity<UserId> {
  private email: Email
  private name: string

  static create(props: { email: Email; name: string }): User {
    return new User(UserId.create(), props.email, props.name)
  }

  static reconstruct(props: {
    id: UserId
    email: Email
    name: string
    createdAt: Date
    updatedAt: Date
  }): User {
    return new User(props.id, props.email, props.name, props.createdAt, props.updatedAt)
  }

  // Getters
  getEmail(): Email {
    return this.email
  }

  // Business logic
  changeEmail(newEmail: Email): void {
    this.email = newEmail
    this.updateTimestamp()
  }
}

// 3. Repository Interface
export interface IUserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
}

// 4. DTO
export class CreateUserDTO {
  email: string
  name: string
}

// 5. Use Case
export class CreateUserUseCase
  implements IUseCase<CreateUserDTO, UserResponseDTO>
{
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserDTO): Promise<UserResponseDTO> {
    const email = Email.create(request.email)
    const user = User.create({
      email,
      name: request.name,
    })
    await this.userRepository.save(user)
    return this.toPresentationModel(user)
  }

  private toPresentationModel(user: User): UserResponseDTO {
    return new UserResponseDTO({
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
    })
  }
}

// 6. Controller
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = new CreateUserDTO(req.body)
      const result = await this.createUserUseCase.execute(dto)
      res.status(201).json(result)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }
}
```

### Frontend

#### Estructura módular
```typescript
// Cada módulo es auto-contido
src/modules/
├── featureName/
│   ├── pages/
│   │   ├── FeatureListPage.tsx
│   │   ├── FeatureDetailPage.tsx
│   │   └── FeatureFormPage.tsx
│   ├── components/
│   │   ├── FeatureForm.tsx
│   │   ├── FeatureList.tsx
│   │   └── FeatureCard.tsx
│   └── index.ts (export público)
```

#### Componentes React
```typescript
// Usar FC (Function Component) con TypeScript
export const FeatureForm: React.FC<{ onSubmit: (data: any) => void }> = ({
  onSubmit,
}) => {
  const [state, setState] = useState<FormState>(initialState)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(state)
  }

  return <form onSubmit={handleSubmit}>{/* JSX */}</form>
}
```

#### Hooks Custom
```typescript
// hooks/ - patrones reutilizables
export const useFeature = () => {
  const [state, setState] = useState<Feature[]>([])

  useEffect(() => {
    fetchFeatures().then(setState)
  }, [])

  return { features: state }
}
```

#### State Management (Zustand)
```typescript
// Estado global, simple y eficiente
interface FeatureStore {
  features: Feature[]
  loading: boolean
  setFeatures: (features: Feature[]) => void
  addFeature: (feature: Feature) => void
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  features: [],
  loading: false,
  setFeatures: (features) => set({ features }),
  addFeature: (feature) =>
    set((state) => ({
      features: [...state.features, feature],
    })),
}))
```

## 🧪 Testing

### Backend - Unit Tests
```typescript
describe('CreateUserUseCase', () => {
  it('should create a new user with valid email', async () => {
    const mockRepository = {
      save: vi.fn(),
    } as unknown as IUserRepository

    const useCase = new CreateUserUseCase(mockRepository)
    const result = await useCase.execute(new CreateUserDTO({
      email: 'valid@email.com',
      name: 'John Doe',
    }))

    expect(mockRepository.save).toHaveBeenCalled()
    expect(result.email).toBe('valid@email.com')
  })

  it('should throw error with invalid email', async () => {
    // ...
    expect(useCase.execute(...)).rejects.toThrow()
  })
})
```

### Frontend - Component Tests
```typescript
describe('FeatureForm', () => {
  it('should submit form with valid data', () => {
    const onSubmit = vi.fn()
    render(<FeatureForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Feature' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Feature' })
    )
  })
})
```

## 📋 Checklist para Pull Request

### Antes de hacer PR
- [ ] Tests escritos y pasando
- [ ] Linting sin errores (`npm run lint`)
- [ ] Código formateado (`npm run format`)
- [ ] Cambios documentados
- [ ] Sin console.logs de debug
- [ ] Sigue la arquitectura hexagonal
- [ ] DTOs para inputs de controllers
- [ ] Validaciones en Value Objects

### En el PR
- [ ] Título descriptivo
- [ ] Descripción del cambio
- [ ] Linked issues
- [ ] Tests incluidos
- [ ] Screenshots (si aplica)

## 🚀 Flujo de Trabajo

### 1. Crear una rama
```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/nombre-del-bug
```

### 2. Hacer cambios siguiendo arquitectura
```
Editar archivos siguiendo la estructura DDD
```

### 3. Tests
```bash
npm test
```

### 4. Lint & Format
```bash
npm run lint
npm run format
```

### 5. Commit
```bash
git add .
git commit -m "feat: descripción breve del cambio"
```

### 6. Push y PR
```bash
git push origin feature/nueva-funcionalidad
# Luego crear PR en GitHub
```

## 🐛 Debugging

### Backend
```bash
# Con inspector en VS Code
npm run dev
# Se abrirá debugger en chrome://inspect
```

### Frontend
- Usar React DevTools extensión
- Vue DevTools para state
- Network tab para ver APIs

## 📚 Recursos

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)

## ❓ Preguntas Frecuentes

**P: ¿Dónde va la lógica de negocio?**  
A: En Domain. Entities y Value Objects contienen las reglas de negocio.

**P: ¿Cuándo usar un agregado vs una entidad?**  
A: Agregado es una raíz coherente, entidades dentro de agregados.

**P: ¿Y los eventos de dominio?**  
A: Los implementaremos en sprints futuros con event sourcing.

**P: ¿Puedo usar un librería X?**  
A: Pregunta primero. Mantener dependencies al mínimo.

---

**Preguntas?** Abre un issue o discusión en GitHub.
