import 'module-alias/register';
import dataSource from '../../../ormconfig';
import { UserTypeormEntity } from '@infrastructure/entities/user.typeorm.entity';
import { hashPassword } from '@libs/helpers';

async function seedUser() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(UserTypeormEntity);

  const existingUser = await userRepository.findOne({
    where: { email: 'admin@kaori.com' },
  });

  if (existingUser) {
    console.log('User admin@kaori.com already exists, skipping seed.');
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await hashPassword('miyazono');

  const user = userRepository.create({
    lastName: 'Miyazono',
    firstName: 'kaori',
    email: 'admin@kaori.com',
    password: hashedPassword,
    isActive: true,
    isTwoFactorEnabled: false,
  });

  await userRepository.save(user);

  console.log('Default user created successfully:');
  console.log('  Email: admin@kaori.com');
  console.log('  Password: miyazono');

  await dataSource.destroy();
}

seedUser().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
