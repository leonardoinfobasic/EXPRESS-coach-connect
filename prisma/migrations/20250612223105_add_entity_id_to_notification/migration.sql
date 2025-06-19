/*
  Warnings:

  - Added the required column `trainer_id` to the `workout_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `workout_plans` DROP FOREIGN KEY `workout_plans_client_id_fkey`;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `entityId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `workout_plans` ADD COLUMN `trainer_id` INTEGER NOT NULL,
    MODIFY `client_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_trainer_id_fkey` FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
