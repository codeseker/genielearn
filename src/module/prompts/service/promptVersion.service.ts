import { Injectable } from '@nestjs/common';
import { Agents } from '../../llm/service/llm.service.js';

@Injectable()
export class PromptVersionService {


    async getActiveVersion(prompt: string, agentId: Agents) {
        
    }
}