import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { PrismaService } from "@prisma/prisma.service"; // Import PrismaHealthIndicator

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,  // Inject PrismaHealthIndicator from @nestjs/terminus
    private prismaService: PrismaService
  ) {
  }

  @Get()
  @HealthCheck()
  readiness() {
    return this.health.check([
      async () => this.prisma.pingCheck("database", this.prismaService)
    ]);
  }
}
