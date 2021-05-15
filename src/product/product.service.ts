import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schema/product.model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async insertProduct(title: string, desc: string, price: number, image) {
    const lastProd = await this.productModel
      .findOne()
      .sort({ _id: 'desc' })
      .exec();
    console.log('id', lastProd);
    let parsedId;

    if (lastProd) {
      let lastNumber;
      if (lastProd._id < 10) {
        lastNumber = ++lastProd._id;
        parsedId = `0000${lastNumber}`;
      } else if (lastProd._id < 100) {
        lastNumber = ++lastProd._id;
        parsedId = `000${lastNumber}`;
      } else if (lastProd._id < 1000) {
        lastNumber = ++lastProd._id;
        parsedId = `00${lastNumber}`;
      } else if (lastProd._id < 10000) {
        lastNumber = ++lastProd._id;
        parsedId = `0${lastNumber}`;
      } else {
        lastNumber = ++lastProd._id;
        parsedId = lastNumber;
      }
    } else {
      parsedId = '00000';
    }
    const newProduct = new this.productModel({
      _id: parsedId,
      title,
      description: desc,
      price,
      image: image.filename,
    });
    const result = await newProduct.save();

    return result.id as string;
  }

  async getProducts({ limit, page, sortP, sortD }) {
    const limitedProducts = Math.abs(+limit) || 10;
    const limitedPages = Math.abs(+page) || 0;
    const sortByPrice = sortP === 'down' ? ['price', 'desc'] : ['price'];
    const sortByDate =
      sortD === 'down' ? ['createdAt', 'desc'] : ['createdAt', 'asc'];
    const products = await this.productModel
      .find()
      .sort([sortByPrice, sortByDate])
      .limit(limitedProducts)
      .skip(limitedProducts * limitedPages)
      .exec();
    return {
      data: products,
      limitProduct: limitedProducts,
      currentPage: limitedPages,
      sortP ,
      sortD
    };
  }

  async getSingleProduct(productId) {
    const product = await this.findProduct(productId);
    return product;
  }

  async updateProduct(data) {
    const updatedProduct = await this.productModel.updateOne(
      { _id: data.id },
      { ...data, _id: data.id },
    );
    return updatedProduct;
  }

  async deleteProduct(prodId) {
    const result = await this.productModel.deleteOne({ _id: prodId }).exec();
    if (result.n === 0) {
      throw new NotFoundException('Could not find product.');
    } else {
      return { success: 'Product was successfully deleted' };
    }
  }

  private async findProduct(id): Promise<Product> {
    let product;
    try {
      product = await this.productModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException('Could not find product.');
    }
    if (!product) {
      throw new NotFoundException('Could not find product.');
    }
    return product;
  }
}
