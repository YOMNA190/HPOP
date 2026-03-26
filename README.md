# Happiness Plaza Operations Platform (HPOP)

## Project Overview

The **Happiness Plaza Operations Platform (HPOP)** is a comprehensive facility management and real estate operations platform designed to streamline and enhance the management of properties, services, and user interactions. Developed with a modern tech stack, HPOP aims to provide a robust, scalable, and user-friendly solution for managing complex operational workflows, particularly in the real estate sector in regions like Qena, Egypt.

## Features

*   **User Authentication & Authorization:** Secure user login, registration, and role-based access control.
*   **Real-time Communication:** Instant updates and notifications for critical events using WebSockets.
*   **Interactive Dashboards:** Data visualization and reporting for key operational metrics.
*   **Property Management:** Tools for managing properties, units, and related assets.
*   **Maintenance & Services:** Workflow for handling maintenance requests and service delivery.
*   **Internationalization (i18n):** Support for multiple languages to cater to diverse user bases.
*   **Responsive Design:** Optimized for various devices and screen sizes.
*   **Advanced UI Components:** Rich and accessible user interface built with modern UI libraries.
*   **Background Job Processing:** Efficient handling of long-running tasks.

## Technologies Used

### Frontend (`app` directory)

The frontend application is built using cutting-edge web technologies to deliver a dynamic and responsive user experience.

*   **React 19 & TypeScript:** For building robust and type-safe user interfaces.
*   **Vite:** A fast and efficient build tool for modern web development.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development and consistent styling.
*   **Radix UI:** A collection of accessible, unstyled components for building high-quality design systems.
*   **GSAP, Three.js, D3.js, React Three Fiber:** For advanced animations, 3D graphics, and data visualization.
*   **Leaflet & React Leaflet:** For interactive mapping functionalities.
*   **Zustand:** A lightweight and flexible state management solution.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **i18next & React i18next:** For internationalization and localization.
*   **Framer Motion:** A production-ready motion library for React.
*   **Tanstack React Query:** For data fetching, caching, and synchronization.
*   **Socket.io-client:** For real-time, bidirectional event-based communication.

### Backend (`hpop/backend` directory)

The backend API is developed with a focus on performance, scalability, and security.

*   **Node.js & Express:** A powerful JavaScript runtime and web application framework.
*   **TypeScript:** For type-safe backend development.
*   **Prisma:** A modern database toolkit (ORM) for efficient and type-safe database access.
*   **PostgreSQL (implied):** A robust relational database system.
*   **bcryptjs & jsonwebtoken:** For secure password hashing and token-based authentication.
*   **BullMQ & ioredis:** For robust background job processing and Redis integration.
*   **Winston:** A versatile logging library.
*   **Socket.io:** For real-time communication with the frontend.
*   **Jest & Supertest:** For comprehensive unit and integration testing.

### Infrastructure & Tools

*   **Docker & Docker Compose:** For containerization and simplified deployment of both frontend and backend services.
*   **Nginx:** As a reverse proxy and web server.

## Getting Started

To get a copy of the project up and running on your local machine for development and testing purposes, follow these steps.

### Prerequisites

Ensure you have the following installed:

*   Node.js (v18.x or higher)
*   npm or Yarn
*   Docker & Docker Compose
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOMNA190/HPOP.git
    cd HPOP
    ```

2.  **Backend Setup:**
    ```bash
    cd hpop/backend
    npm install
    npx prisma migrate dev --name init
    npm run db:seed # Optional: to seed the database with initial data
    cd ..
    ```

3.  **Frontend Setup:**
    ```bash
    cd app
    npm install
    cd ..
    ```

### Running the Project

#### Development Mode (using Docker Compose)

For a full-stack development environment, you can use Docker Compose:

```bash
cd hpop/docker
docker-compose up --build
```

This will start the backend, frontend, and any other services defined in `docker-compose.yml`.

#### Development Mode (manual)

**Backend:**

```bash
cd hpop/backend
npm run dev
```

**Frontend:**

```bash
cd app
npm run dev
```

## Project Structure

```
HPOP/
├── app/                 # Main Frontend Application (React, Vite, TypeScript)
│   ├── public/
│   ├── src/
│   └── ...
├── hpop/                # Core HPOP services
│   ├── backend/         # Backend API (Node.js, Express, TypeScript, Prisma)
│   │   ├── prisma/      # Database schema and migrations
│   │   ├── src/         # Backend source code (routes, services, middleware)
│   │   └── ...
│   ├── docker/          # Docker configurations for deployment
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   ├── docker-compose.yml
│   │   └── nginx.conf
│   └── frontend/        # Potentially an alternative or older frontend (React, Vite)
│       └── app/
│           └── ...
└── hpop-demo/           # Simple demo HTML file
    └── index.html
```

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, please contact [YOMNA190](https://github.com/YOMNA190).

---

# منصة عمليات هابينيس بلازا (HPOP)

## نظرة عامة على المشروع

**منصة عمليات هابينيس بلازا (HPOP)** هي منصة شاملة لإدارة المرافق والعمليات العقارية، مصممة لتبسيط وتعزيز إدارة الممتلكات والخدمات وتفاعلات المستخدمين. تم تطوير HPOP باستخدام مجموعة تقنيات حديثة، وتهدف إلى توفير حل قوي وقابل للتطوير وسهل الاستخدام لإدارة سير العمليات المعقدة، خاصة في قطاع العقارات في مناطق مثل قنا، مصر.

## الميزات

*   **مصادقة المستخدم وتخويله:** تسجيل دخول المستخدمين وتسجيلهم بشكل آمن، والتحكم في الوصول بناءً على الأدوار.
*   **الاتصال في الوقت الفعلي:** تحديثات وإشعارات فورية للأحداث الهامة باستخدام WebSockets.
*   **لوحات تحكم تفاعلية:** تصور البيانات وإعداد التقارير لمقاييس التشغيل الرئيسية.
*   **إدارة الممتلكات:** أدوات لإدارة الممتلكات والوحدات والأصول ذات الصلة.
*   **الصيانة والخدمات:** سير عمل للتعامل مع طلبات الصيانة وتقديم الخدمات.
*   **الدولية (i18n):** دعم لغات متعددة لتلبية احتياجات قواعد المستخدمين المتنوعة.
*   **تصميم متجاوب:** مُحسّن لمختلف الأجهزة وأحجام الشاشات.
*   **مكونات واجهة مستخدم متقدمة:** واجهة مستخدم غنية وسهلة الوصول مبنية على مكتبات واجهة المستخدم الحديثة.
*   **معالجة المهام الخلفية:** معالجة فعالة للمهام طويلة الأمد.

## التقنيات المستخدمة

### الواجهة الأمامية (مجلد `app`)

تم بناء تطبيق الواجهة الأمامية باستخدام أحدث تقنيات الويب لتقديم تجربة مستخدم ديناميكية ومتجاوبة.

*   **React 19 و TypeScript:** لبناء واجهات مستخدم قوية وآمنة من حيث النوع.
*   **Vite:** أداة بناء سريعة وفعالة لتطوير الويب الحديث.
*   **Tailwind CSS:** إطار عمل CSS يعتمد على الأدوات المساعدة لتطوير واجهة المستخدم بسرعة وتصميم متناسق.
*   **Radix UI:** مجموعة من المكونات التي يمكن الوصول إليها وغير المصممة لبناء أنظمة تصميم عالية الجودة.
*   **GSAP, Three.js, D3.js, React Three Fiber:** للرسوم المتحركة المتقدمة والرسومات ثلاثية الأبعاد وتصور البيانات.
*   **Leaflet و React Leaflet:** لوظائف الخرائط التفاعلية.
*   **Zustand:** حل خفيف ومرن لإدارة الحالة.
*   **Axios:** عميل HTTP يعتمد على الوعود لإجراء طلبات API.
*   **i18next و React i18next:** للتدويل والتوطين.
*   **Framer Motion:** مكتبة حركة جاهزة للإنتاج لـ React.
*   **Tanstack React Query:** لجلب البيانات والتخزين المؤقت والمزامنة.
*   **Socket.io-client:** للاتصال في الوقت الفعلي ثنائي الاتجاه القائم على الأحداث.

### الواجهة الخلفية (مجلد `hpop/backend`)

تم تطوير واجهة برمجة التطبيقات الخلفية مع التركيز على الأداء وقابلية التوسع والأمان.

*   **Node.js و Express:** بيئة تشغيل JavaScript قوية وإطار عمل لتطبيقات الويب.
*   **TypeScript:** لتطوير الواجهة الخلفية الآمنة من حيث النوع.
*   **Prisma:** مجموعة أدوات قاعدة بيانات حديثة (ORM) للوصول الفعال والآمن من حيث النوع إلى قاعدة البيانات.
*   **PostgreSQL (مُضمن):** نظام قاعدة بيانات علائقية قوي.
*   **bcryptjs و jsonwebtoken:** لتجزئة كلمات المرور الآمنة والمصادقة القائمة على الرمز المميز.
*   **BullMQ و ioredis:** لمعالجة المهام الخلفية القوية وتكامل Redis.
*   **Winston:** مكتبة تسجيل متعددة الاستخدامات.
*   **Socket.io:** للاتصال في الوقت الفعلي مع الواجهة الأمامية.
*   **Jest و Supertest:** لاختبارات الوحدة والتكامل الشاملة.

### البنية التحتية والأدوات

*   **Docker و Docker Compose:** للحاويات والنشر المبسط لكل من خدمات الواجهة الأمامية والخلفية.
*   **Nginx:** كوكيل عكسي وخادم ويب.

## البدء

للحصول على نسخة من المشروع وتشغيلها على جهازك المحلي لأغراض التطوير والاختبار، اتبع هذه الخطوات.

### المتطلبات الأساسية

تأكد من تثبيت ما يلي:

*   Node.js (الإصدار 18.x أو أعلى)
*   npm أو Yarn
*   Docker و Docker Compose
*   Git

### التثبيت

1.  **استنساخ المستودع:**
    ```bash
    git clone https://github.com/YOMNA190/HPOP.git
    cd HPOP
    ```

2.  **إعداد الواجهة الخلفية:**
    ```bash
    cd hpop/backend
    npm install
    npx prisma migrate dev --name init
    npm run db:seed # اختياري: لملء قاعدة البيانات ببيانات أولية
    cd ..
    ```

3.  **إعداد الواجهة الأمامية:**
    ```bash
    cd app
    npm install
    cd ..
    ```

### تشغيل المشروع

#### وضع التطوير (باستخدام Docker Compose)

لبيئة تطوير كاملة المكدس، يمكنك استخدام Docker Compose:

```bash
cd hpop/docker
docker-compose up --build
```

سيؤدي هذا إلى تشغيل الواجهة الخلفية والواجهة الأمامية وأي خدمات أخرى محددة في `docker-compose.yml`.

#### وضع التطوير (يدوي)

**الواجهة الخلفية:**

```bash
cd hpop/backend
npm run dev
```

**الواجهة الأمامية:**

```bash
cd app
npm run dev
```

## هيكل المشروع

```
HPOP/
├── app/                 # تطبيق الواجهة الأمامية الرئيسي (React, Vite, TypeScript)
│   ├── public/
│   ├── src/
│   └── ...
├── hpop/                # خدمات HPOP الأساسية
│   ├── backend/         # واجهة برمجة التطبيقات الخلفية (Node.js, Express, TypeScript, Prisma)
│   │   ├── prisma/      # مخطط قاعدة البيانات والترحيلات
│   │   ├── src/         # كود مصدر الواجهة الخلفية (المسارات، الخدمات، البرمجيات الوسيطة)
│   │   └── ...
│   ├── docker/          # تكوينات Docker للنشر
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   ├── docker-compose.yml
│   │   └── nginx.conf
│   └── frontend/        # واجهة أمامية بديلة أو أقدم (React, Vite)
│       └── app/
│           └── ...
└── hpop-demo/           # ملف HTML تجريبي بسيط
    └── index.html
```

## المساهمة

المساهمات مرحب بها! يرجى اتباع هذه الخطوات:

1.  قم بعمل Fork للمستودع.
2.  أنشئ فرعًا جديدًا (`git checkout -b feature/YourFeature`).
3.  قم بإجراء تغييراتك.
4.  قم بتثبيت تغييراتك (`git commit -m 'Add some feature'`).
5.  ادفع إلى الفرع (`git push origin feature/YourFeature`).
6.  افتح طلب سحب (Pull Request).

## الترخيص

هذا المشروع مرخص بموجب ترخيص MIT - انظر ملف [LICENSE](LICENSE) لمزيد من التفاصيل.

## الاتصال

لأية استفسارات أو دعم، يرجى الاتصال بـ [YOMNA190](https://github.com/YOMNA190).
