import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { TestCase } from '../../models/CodingQuestion';
import { ParsedExecutionResult } from './resultParser';

export const localExecutor = {
  async runAll(code: string, language: string, testCases: TestCase[]): Promise<ParsedExecutionResult[]> {
    const results: ParsedExecutionResult[] = [];
    
    // Create a temp directory for this run
    const runId = Math.random().toString(36).substring(7);
    const tempDir = path.join(os.tmpdir(), `if_run_${runId}`);
    await fs.mkdir(tempDir, { recursive: true });

    let executablePath = '';
    
    try {
      if (language === 'JavaScript') {
        executablePath = path.join(tempDir, 'main.js');
        await fs.writeFile(executablePath, code);
      } else if (language === 'Java') {
        const sourcePath = path.join(tempDir, 'Main.java');
        await fs.writeFile(sourcePath, code);
        
        // Compile Java
        await new Promise<void>((resolve, reject) => {
          const javac = spawn('javac', [sourcePath], { cwd: tempDir });
          let stderr = '';
          javac.stderr.on('data', data => stderr += data);
          javac.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(stderr));
          });
        });
      }

      // Run each test case sequentially
      for (const tc of testCases) {
        const startTime = Date.now();
        const { stdout, stderr, code: exitCode } = await this.runProcess(language, tempDir, tc.input);
        const time = Date.now() - startTime;
        
        const passed = exitCode === 0 && stdout.trim() === tc.expectedOutput.trim();
        
        results.push({
          status: exitCode !== 0 ? 'Runtime Error' : (passed ? 'Accepted' : 'Wrong Answer'),
          output: stdout.trim(),
          expectedOutput: tc.expectedOutput.trim(),
          passed,
          time,
          memory: 2048, // Mock memory for local sandbox
          error: stderr || undefined
        });
      }
    } catch (e: any) {
      // Compilation error or other setup error
      for (let i = 0; i < testCases.length; i++) {
        results.push({
          status: 'Compilation Error',
          output: '',
          passed: false,
          time: 0,
          memory: 0,
          error: e.message
        });
      }
    } finally {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    }

    return results;
  },

  async runProcess(language: string, cwd: string, input: string): Promise<{ stdout: string, stderr: string, code: number }> {
    return new Promise((resolve) => {
      let cmd = '';
      let args: string[] = [];

      if (language === 'JavaScript') {
        cmd = 'node';
        args = ['main.js'];
      } else if (language === 'Java') {
        cmd = 'java';
        args = ['Main'];
      }

      const proc = spawn(cmd, args, { cwd });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', data => stdout += data);
      proc.stderr.on('data', data => stderr += data);
      
      proc.on('close', code => {
        resolve({ stdout, stderr, code: code ?? 1 });
      });

      // Write stdin
      proc.stdin.write(input);
      proc.stdin.end();
    });
  }
};
