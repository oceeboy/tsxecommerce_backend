import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RolesGuard } from './common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS with explicit configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Restrict to your frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set up versioning: All routes will be prefixed with 'v1/api'
  app.setGlobalPrefix('v1/api'); // This adds /v1/api to every route

  // Setup Swagger API documentation for all environments
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TSX E-commerce API') // the shopper extreme
    .setDescription(
      process.env.NODE_ENV === 'production'
        ? 'Production API documentation for TSX e-commerce'
        : 'Development API documentation for TSX e-commerce',
    )
    .setVersion('1.0')
    .addBearerAuth() // Add authorization header (useful for secured APIs)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document); // Swagger available at /api-docs

  // Apply global guards (e.g., RolesGuard for role-based access control)
  app.useGlobalGuards(new RolesGuard(new Reflector()));

  // Graceful startup with dynamic port configuration
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Use '0.0.0.0' to ensure it binds on all network interfaces
  // console.log(`Application is running on: ${await app.getUrl()}`);
  // console.log(`API documentation available at: ${await app.getUrl()}/api-docs`);
}

// // Global exception handling for critical errors
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err);
//   process.exit(1); // Exit to avoid unstable state
// });

// process.on('unhandledRejection', (reason) => {
//   console.error('Unhandled Rejection:', reason);
//   // Optionally log additional details or send alerts
// });

bootstrap();

/*

Creating a test helper function to render last 10 tasks in the database
UserType::{ id: string, name: string , email: string, password: string, role: "admin" },

 const Task[ { title: "Task 1", description: "Description 1", userId: "2" , id: "1"}, 
 { title: "Task 2", description: "Description 2", userId: "2" , id: "2"},
  { title: "Task 3", description: "Description 3", userId: "1", id: "3" },
   { title: "Task 4", description: "Description 4", userId: "1", id: "4" },  
    { title: "Task 5", description: "Description 5", userId: "3", id: "5" },
     { title: "Task 6", description: "Description 6", userId: "1", id: "6" },
      { title: "Task 7", description: "Description 7", userId: "3" , id: "7"},
        { title: "Task 8", description: "Description 8", userId: "3" , id: "8"},
         { title: "Task 9", description: "Description 9", userId: "1" , id: "9"},
          { title: "Task 10", description: "Description 10", userId: "1" , id: "10"},
           { title: "Task 11", description: "Description 11", userId: "2" , id: "11"},
            { title: "Task 12", description: "Description 12", userId: "2" , id: "12"},
             { title: "Task 13", description: "Description 13", userId: "3" , id: "13"},
            ]

            stored in the database mondodb as example

            Mitigation::(userId.InTheTaskObject) :: 1. Use the userId to get the user object from the database and store it in the task object ObjectOfUserType{"2"}:: { id: "2", name: "User 2", email: 

            newTaskes = Task.map(task => {
  const user = User.find(user => user.id === task.userId);
  return { ...task, user };
}
renderLast10Tasks(userId: string) :: {

const UserTasks=  newTaskes.filter(task => task.userId === userId);

userTasks.slice(-10)==> last_Ten_tasks;


last_Ten_tasks.findTheLast((n)==> n.id::UsingTheHighestIdNumber(parseInt(n.id))) ==> LastTask

return:: LastTask





}


**************************************************************************************************** */
