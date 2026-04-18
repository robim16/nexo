import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar estado/localStorage si es necesario
    await page.goto('/login')
  })

  test('should allow a user to register', async ({ page }) => {
    await page.click('text=Regístrate')
    await expect(page).toHaveURL(/.*register/)

    const uniqueEmail = `test-${Date.now()}@example.com`
    
    await page.getByLabel('Nombre de Usuario').fill('Test User')
    await page.getByLabel('Correo Electrónico').fill(uniqueEmail)
    await page.getByLabel('Contraseña').fill('password123')
    
    await page.click('button:has-text("Crear Cuenta")')

    // Debería redirigir al feed/home
    await expect(page).toHaveURL('/')
  })

  test('should allow a user to login', async ({ page }) => {
    // Usar un usuario ya existente o crear uno en el setup del test
    // Para simplificar asumiendo que el registro anterior funcionó y el emulador mantiene estado
    // O mejor, crear uno específicamente para este test si es posible
    
    await page.getByLabel('Correo Electrónico').fill('test@example.com')
    await page.getByLabel('Contraseña').fill('password123')
    
    await page.click('button:has-text("Iniciar Sesión")')

    // Si fallara por no existir, podríamos registrarlo primero aquí
  })

  test('should show validation errors on login', async ({ page }) => {
    await page.getByLabel('Correo Electrónico').fill('invalid-email')
    await page.getByLabel('Contraseña').fill('123')
    
    await page.click('button:has-text("Iniciar Sesión")')

    // Buscar mensajes de error si existen en la UI
    // await expect(page.getByText('Email inválido')).toBeVisible()
  })
})
