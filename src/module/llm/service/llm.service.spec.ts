import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service.js';
import { BaseLLMService } from './base-llm.service.js';
import { LlmUsageService } from './llm-usage.service.js';
import { PromptVersionService } from '../../prompts/service/promptVersion.service.js';
import { vi } from 'vitest';

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LLMService,
        {
          provide: BaseLLMService,
          useValue: {
            providerName: 'test',
            callStructured: vi.fn(),
          },
        },
        {
          provide: LlmUsageService,
          useValue: {
            record: vi.fn(),
          },
        },
        {
          provide: PromptVersionService,
          useValue: {
            getActiveVersion: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LLMService>(LLMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
