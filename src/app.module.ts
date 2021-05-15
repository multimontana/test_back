import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://overlordDB:vasterlord_9600@cluster0.6mpvp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    ),
    AuthModule,
    ProductModule,
    MulterModule.register({
      dest: './public',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
