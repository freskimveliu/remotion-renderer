import { RenderJob, JobStatus } from "../../types";

class JobQueue {
  private jobs: Map<string, RenderJob> = new Map();
  private queue: string[] = [];
  private processing = false;
  private concurrency: number;
  private activeCount = 0;
  private onProcess: ((job: RenderJob) => Promise<void>) | null = null;

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }

  setProcessor(fn: (job: RenderJob) => Promise<void>) {
    this.onProcess = fn;
  }

  addJob(job: RenderJob): void {
    this.jobs.set(job.id, job);
    this.queue.push(job.id);
    this.processNext();
  }

  getJob(id: string): RenderJob | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): RenderJob[] {
    return Array.from(this.jobs.values());
  }

  updateJob(id: string, updates: Partial<RenderJob>): void {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    }
  }

  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === "queued") {
      this.queue = this.queue.filter((jid) => jid !== id);
      this.updateJob(id, { status: "cancelled" });
      return true;
    }

    if (job.status === "bundling" || job.status === "rendering") {
      this.updateJob(id, { status: "cancelled" });
      return true;
    }

    return false;
  }

  private async processNext(): Promise<void> {
    if (!this.onProcess) return;
    if (this.activeCount >= this.concurrency) return;
    if (this.queue.length === 0) return;

    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job || job.status === "cancelled") {
      this.processNext();
      return;
    }

    this.activeCount++;

    try {
      await this.onProcess(job);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      this.updateJob(jobId, { status: "failed", error: message });
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }
}

export const jobQueue = new JobQueue(
  parseInt(process.env.CONCURRENCY || "1", 10)
);
