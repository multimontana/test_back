import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.model';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}
  async save(data: RegisterDto) {
    try {
      const slatOrRounds = 10;
      const hash = await bcrypt.hash(data.password, slatOrRounds);
      const newUser = new this.userModel({ ...data, password: hash });
      const result = await newUser.save();
      return result;
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.FOUND,
          error: 'User was already created',
        },
        HttpStatus.FOUND,
      );
    }
  }

  async login(data) {
    const user = await this.userModel.findOne({ email: data.email });
    if (user) {
      const password = await bcrypt.compare(data.password, user.password);
      if (!password) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'incorrect password',
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        return { token: this.jwtService.sign({ id: user.id }) };
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async verifyUser(token) {
    const verified = await this.jwtService.sign(token);
    return verified;
  }
}
