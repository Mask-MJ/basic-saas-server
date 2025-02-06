import { WorkerHost, Processor, OnQueueEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('user')
export class UserConsumer extends WorkerHost {
  private readonly logger = new Logger(UserConsumer.name);
  @OnQueueEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
  async process(job: Job<any, any, string>): Promise<any> {
    console.log('Processing job', job.id, job.name, job.data);
    return {};
  }
}
