import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  PREFIX: string;

  @IsString()
  APP_NAME: string;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_DB: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @IsNumber()
  @Min(0)
  @Max(65535)
  MINIO_PORT: number;

  @IsString()
  MINIO_ENDPOINT: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  MINIO_CLIENT_PORT: number;

  @IsString()
  MINIO_ROOT_USER: string;

  @IsString()
  MINIO_ROOT_PASSWORD: string;

  @IsString()
  MINIO_ACCESS_KEY: string;

  @IsString()
  MINIO_SECRET_KEY: string;

  @IsNumber()
  BCRYPT_SALT: number;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  JWT_ACCESS_TOKEN_TTL: number;

  @IsNumber()
  JWT_REFRESH_TOKEN_TTL: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
