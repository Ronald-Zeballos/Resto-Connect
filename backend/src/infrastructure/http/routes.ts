import express from 'express'
import { RestaurantController } from './controllers/RestaurantController'
import { AuthController } from './controllers/AuthController'
import { MenuController } from './controllers/MenuController'
import { CreateRestaurantUseCase } from '@application/use-cases/CreateRestaurantUseCase'
import { GetRestaurantByIdUseCase } from '@application/use-cases/GetRestaurantByIdUseCase'
import { UpdateRestaurantUseCase } from '@application/use-cases/UpdateRestaurantUseCase'
import { DeleteRestaurantUseCase } from '@application/use-cases/DeleteRestaurantUseCase'
import {
  ListRestaurantsUseCase,
  GetRestaurantsByOwnerUseCase,
} from '@application/use-cases/ListRestaurantsUseCase'
import { CreateMenuUseCase } from '@application/use-cases/CreateMenuUseCase'
import { AddMenuItemUseCase } from '@application/use-cases/AddMenuItemUseCase'
import { UpdateMenuItemUseCase } from '@application/use-cases/UpdateMenuItemUseCase'
import { DeleteMenuItemUseCase } from '@application/use-cases/DeleteMenuItemUseCase'
import { GetMenuByRestaurantIdUseCase } from '@application/use-cases/GetMenuByRestaurantIdUseCase'
import { RegisterUserUseCase } from '@application/use-cases/RegisterUserUseCase'
import { LoginUserUseCase } from '@application/use-cases/LoginUserUseCase'
import { ValidateTokenUseCase } from '@application/use-cases/TokenUseCase'
import { InMemoryRestaurantRepository } from '@infrastructure/persistence/repositories/InMemoryRestaurantRepository'
import { InMemoryUserRepository } from '@infrastructure/persistence/repositories/InMemoryUserRepository'
import { InMemoryMenuRepository } from '@infrastructure/persistence/repositories/InMemoryMenuRepository'
import { PasswordHasher } from '@infrastructure/security/PasswordHasher'
import { JwtTokenGenerator } from '@infrastructure/security/JwtTokenGenerator'
import {
  createAuthMiddleware,
  createOptionalAuthMiddleware,
} from '@infrastructure/http/middlewares/AuthMiddleware'

// ============ INICIALIZAR DEPENDENCIAS ============

// Repositories
const restaurantRepository = new InMemoryRestaurantRepository()
const userRepository = new InMemoryUserRepository()
const menuRepository = new InMemoryMenuRepository()

// Services
const passwordHasher = new PasswordHasher()
const jwtTokenGenerator = new JwtTokenGenerator()

// Use Cases - Restaurant
const createRestaurantUseCase = new CreateRestaurantUseCase(restaurantRepository)
const getRestaurantByIdUseCase = new GetRestaurantByIdUseCase(restaurantRepository)
const updateRestaurantUseCase = new UpdateRestaurantUseCase(restaurantRepository)
const deleteRestaurantUseCase = new DeleteRestaurantUseCase(restaurantRepository)
const listRestaurantsUseCase = new ListRestaurantsUseCase(restaurantRepository)
const getRestaurantsByOwnerUseCase = new GetRestaurantsByOwnerUseCase(restaurantRepository)

// Use Cases - Menu
const createMenuUseCase = new CreateMenuUseCase(menuRepository)
const addMenuItemUseCase = new AddMenuItemUseCase(menuRepository)
const updateMenuItemUseCase = new UpdateMenuItemUseCase(menuRepository)
const deleteMenuItemUseCase = new DeleteMenuItemUseCase(menuRepository)
const getMenuByRestaurantIdUseCase = new GetMenuByRestaurantIdUseCase(menuRepository)

// Use Cases - Auth
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher)
const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  jwtTokenGenerator
)
const validateTokenUseCase = new ValidateTokenUseCase(jwtTokenGenerator)

// Controllers
const restaurantController = new RestaurantController(
  createRestaurantUseCase,
  getRestaurantByIdUseCase,
  updateRestaurantUseCase,
  deleteRestaurantUseCase,
  listRestaurantsUseCase,
  getRestaurantsByOwnerUseCase
)
const menuController = new MenuController(
  createMenuUseCase,
  addMenuItemUseCase,
  updateMenuItemUseCase,
  deleteMenuItemUseCase,
  getMenuByRestaurantIdUseCase
)
const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  validateTokenUseCase
)

// ============ CREAR ROUTER ============
const router = express.Router()

// Middlewares
const authMiddleware = createAuthMiddleware(jwtTokenGenerator)
const optionalAuthMiddleware = createOptionalAuthMiddleware(jwtTokenGenerator)

// ============ RUTAS DE AUTENTICACIÓN ============
router.post('/auth/register', (req, res) => authController.register(req, res))
router.post('/auth/login', (req, res) => authController.login(req, res))
router.post('/auth/validate-token', (req, res) =>
  authController.validateToken(req, res)
)

// ============ RUTAS DE RESTAURANTES ============
router.post('/restaurants', (req, res) => restaurantController.create(req, res))
router.get('/restaurants', (req, res) => restaurantController.list(req, res))
router.get('/restaurants/:id', (req, res) => restaurantController.getById(req, res))
router.put('/restaurants/:id', (req, res) => restaurantController.update(req, res))
router.delete('/restaurants/:id', (req, res) => restaurantController.delete(req, res))
router.get('/restaurants/owner/:ownerId', (req, res) => restaurantController.getByOwner(req, res))

// ============ RUTAS DE MENÚS ============
router.post('/menus', (req, res) => menuController.create(req, res))
router.get('/menus/restaurant/:restaurantId', (req, res) =>
  menuController.getByRestaurant(req, res)
)
router.post('/menus/:menuId/items', (req, res) => menuController.addMenuItem(req, res))
router.put('/menus/:menuId/items/:itemIndex', (req, res) =>
  menuController.updateMenuItem(req, res)
)
router.delete('/menus/:menuId/items/:itemIndex', (req, res) =>
  menuController.deleteMenuItem(req, res)
)

export default router
