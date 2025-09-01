# 📚 OpenShelf

**OpenShelf** es una aplicación móvil que facilita el préstamo de libros entre personas, promoviendo el acceso colaborativo al conocimiento.  
La app permite publicar libros, solicitar préstamos, calificar usuarios y recibir notificaciones en tiempo real sobre cada interacción.  

## ✨ Características principales
- 📖 **Gestión de libros**: publicar, solicitar y devolver.  
- 📍 **Geolocalización**: búsqueda de libros disponibles en un radio definido.  
- 🔔 **Notificaciones push**: avisos en tiempo real al aceptar, rechazar o devolver un libro.  
- ⭐ **Sistema de calificaciones**: puntaje entre usuarios tras finalizar un préstamo.
- 🛠️ **Infraestructura sin backend tradicional**: todo se maneja con **Firebase (Firestore, Auth, Cloud Functions, FCM)**.  

## 🏗️ Arquitectura
- **Frontend**: React Native (Expo) + TypeScript.  
- **Backend**: Firebase Cloud Functions (Node.js).  
- **Base de datos**: Firebase Firestore.  
- **Autenticación**: Firebase Authentication.  
- **Notificaciones**: Firebase Cloud Messaging + Expo.  

## ⚙️ Instalación y ejecución

### 1. Clonar repositorio
```bash
git clone https://github.com/tu-usuario/openshelf.git
cd openshelf
```

### 2. Frontend (React Native + Expo)
```bash
cd app
npm install
npx expo start
```

### 3. Firebase Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

⚠️ **Nota**: asegúrate de tener configurado un proyecto de Firebase y de colocar tu archivo `google-services.json` (Android) y/o `GoogleService-Info.plist` (iOS) en la carpeta correspondiente.  

## 🧪 Pruebas
- El frontend puede probarse con **Expo Go** en dispositivos móviles.  
- Las Cloud Functions pueden validarse con **Firebase Emulator Suite** o tras desplegarlas.  

## 🤝 Contribución
1. Haz un **fork** del repositorio.  
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`).  
3. Realiza un **commit** con tus cambios (`git commit -m "feat: agregar notificación de devolución"`).  
4. Sube la rama (`git push origin feature/nueva-funcionalidad`).  
5. Abre un **Pull Request**.  

## 📌 Roadmap
- [ ] Implementar filtrado avanzado por categorías y autores.  
- [ ] Añadir sistema de recordatorios de devolución.  
- [ ] Implementar incentivos con logros y recompensas.  


