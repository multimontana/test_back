import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { editFileName, imageFileFilter } from './file-upload.utils';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async addProduct(
    @Body('title') prodTitle: string,
    @Body('description') prodDesc: string,
    @Body('price') prodPrice: number,
    @UploadedFile() image,
  ) {
    const response = {
      originalname: image.originalname,
      filename: image.filename,
    };

    const generatedId = await this.productService.insertProduct(
      prodTitle,
      prodDesc,
      prodPrice,
      response,
    );
    return { id: generatedId };
  }

  @Get()
  async getProduct(@Req() param) {
    const result = await this.productService.getProducts(param.query);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateProduct(@Body() data) {
    return this.productService.updateProduct(data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeProduct(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }
}
