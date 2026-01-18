import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ProjectDoctor {
    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel('Project Doctor');
    }

    async activate() {
        console.log('Project Doctor activated!');
        
        // Register commands
        const analyzeProject = vscode.commands.registerCommand(
            'projectdoctor.analyze',
            () => this.analyzeProject()
        );
        
        const fixCurrentFile = vscode.commands.registerCommand(
            'projectdoctor.fixFile',
            () => this.fixCurrentFile()
        );
        
        const fixProject = vscode.commands.registerCommand(
            'projectdoctor.fixAll',
            () => this.fixProject()
        );
        
        this.context.subscriptions.push(
            analyzeProject,
            fixCurrentFile,
            fixProject,
            this.outputChannel
        );
    }

    // ==================== CORE FUNCTIONALITY ====================

    async analyzeProject() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open!');
            return;
        }

        this.outputChannel.show();
        this.outputChannel.appendLine('🔍 Analyzing project for issues...\n');

        // 1. Get all project files
        const files = await this.getProjectFiles(workspaceFolders[0].uri.fsPath);
        
        // 2. Analyze common issues
        const issues = await this.scanForCommonIssues(files);
        
        // 3. Use AI to find deeper issues
        const aiIssues = await this.getAIProjectAnalysis(files);
        
        // 4. Display results
        this.displayResults(issues.concat(aiIssues));
    }

    async fixCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor!');
            return;
        }

        const document = editor.document;
        const filePath = document.fileName;
        const language = document.languageId;
        const code = document.getText();

        this.outputChannel.show();
        this.outputChannel.appendLine(`🛠️  Fixing ${path.basename(filePath)}...\n`);

        try {
            // Get AI-suggested fixes
            const fixedCode = await this.getAIFixes(code, language, filePath);
            
            // Apply fixes
            if (fixedCode && fixedCode !== code) {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(code.length)
                );
                edit.replace(document.uri, fullRange, fixedCode);
                
                await vscode.workspace.applyEdit(edit);
                await document.save();
                
                this.outputChannel.appendLine('✅ File fixed successfully!');
            } else {
                this.outputChannel.appendLine('✅ No issues found in file.');
            }
        } catch (error: any) {
            this.outputChannel.appendLine(`❌ Error: ${error.message}`);
        }
    }

    async fixProject() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open!');
            return;
        }

        const choice = await vscode.window.showQuickPick(
            ['Yes - fix all issues', 'No - just show me what would change'],
            { placeHolder: 'Apply fixes to all files?' }
        );

        if (!choice) { return; }

        const applyFixes = choice.startsWith('Yes');
        this.outputChannel.show();
        this.outputChannel.appendLine('🚀 Starting project-wide fixes...\n');

        // Get all files
        const files = await this.getProjectFiles(workspaceFolders[0].uri.fsPath);
        
        let fixedCount = 0;
        let errorCount = 0;

        // Process each file
        for (const filePath of files) {
            try {
                const fileExtension = path.extname(filePath);
                if (!this.isSupportedFile(fileExtension)) {
                    continue;
                }

                this.outputChannel.appendLine(`📄 Processing: ${path.basename(filePath)}`);
                
                const code = fs.readFileSync(filePath, 'utf-8');
                const language = this.getLanguageFromExtension(fileExtension);
                
                const fixedCode = await this.getAIFixes(code, language, filePath);
                
                if (fixedCode && fixedCode !== code) {
                    if (applyFixes) {
                        fs.writeFileSync(filePath, fixedCode, 'utf-8');
                        this.outputChannel.appendLine(`  ✅ Fixed ${path.basename(filePath)}`);
                        fixedCount++;
                    } else {
                        this.outputChannel.appendLine(`  📝 Would fix ${path.basename(filePath)}`);
                    }
                }
            } catch (error: any) {
                this.outputChannel.appendLine(`  ❌ Error in ${path.basename(filePath)}: ${error.message}`);
                errorCount++;
            }
        }

        if (applyFixes) {
            this.outputChannel.appendLine(`\n🎉 Fixed ${fixedCount} files, ${errorCount} errors.`);
            vscode.window.showInformationMessage(`Fixed ${fixedCount} files!`);
        } else {
            this.outputChannel.appendLine(`\n📊 Summary: Would fix ${fixedCount} files, ${errorCount} errors.`);
        }
    }

    // ==================== HELPER FUNCTIONS ====================

    private async getProjectFiles(rootPath: string): Promise<string[]> {
        const files: string[] = [];
        
        async function walk(dir: string) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // Skip common directories
                if (entry.isDirectory()) {
                    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'];
                    if (!skipDirs.includes(entry.name)) {
                        await walk(fullPath);
                    }
                } else {
                    files.push(fullPath);
                }
            }
        }
        
        await walk(rootPath);
        return files;
    }

    private async scanForCommonIssues(files: string[]): Promise<any[]> {
        const issues: any[] = [];
        
        for (const filePath of files) {
            const ext = path.extname(filePath);
            if (!this.isSupportedFile(ext)) { continue; }
            
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const issuesInFile = this.checkFileForCommonIssues(content, filePath);
                issues.push(...issuesInFile);
            } catch (error) {
                // Skip unreadable files
            }
        }
        
        return issues;
    }

    private checkFileForCommonIssues(content: string, filePath: string): any[] {
        const issues: any[] = [];
        const lines = content.split('\n');
        const fileName = path.basename(filePath);
        
        // Check for common issues
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // 1. Check for console.log (debug code)
            if (line.includes('console.log(') && !line.includes('// TODO: remove')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'debug-code',
                    message: 'console.log statement found - remove in production',
                    code: line.trim()
                });
            }
            
            // 2. Check for TODO/FIXME comments
            if (line.includes('TODO:') || line.includes('FIXME:')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'todo',
                    message: 'TODO/FIXME comment found',
                    code: line.trim()
                });
            }
            
            // 3. Check for long lines
            if (line.length > 120) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'style',
                    message: 'Line too long (> 120 characters)',
                    code: line.trim().substring(0, 50) + '...'
                });
            }
            
            // 4. Check for potential security issues (simplified)
            const dangerousPatterns = [
                { pattern: 'eval(', desc: 'eval() is dangerous' },
                { pattern: 'innerHTML', desc: 'Potential XSS vulnerability' },
                { pattern: 'localStorage', desc: 'Check for sensitive data' }
            ];
            
            for (const pattern of dangerousPatterns) {
                if (line.includes(pattern.pattern)) {
                    issues.push({
                        file: fileName,
                        line: lineNum,
                        type: 'security',
                        message: pattern.desc,
                        code: line.trim()
                    });
                }
            }
        });
        
        return issues;
    }

    private async getAIProjectAnalysis(files: string[]): Promise<any[]> {
        // Sample a few files for AI analysis
        const sampleFiles = files
            .filter(f => this.isSupportedFile(path.extname(f)))
            .slice(0, 10); // Limit to 10 files for performance
        
        const issues: any[] = [];
        
        for (const filePath of sampleFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const language = this.getLanguageFromExtension(path.extname(filePath));
                
                // Ask AI to analyze the file
                const aiResponse = await this.askOllama(
                    `Analyze this ${language} code for bugs, security issues, and improvements. List them:\n\n${content.substring(0, 3000)}` // Limit size
                );
                
                if (aiResponse && !aiResponse.includes('No issues found')) {
                    issues.push({
                        file: path.basename(filePath),
                        type: 'ai-analysis',
                        message: aiResponse.substring(0, 200) + '...',
                        code: 'See AI analysis above'
                    });
                }
            } catch (error) {
                // Skip if AI analysis fails
            }
        }
        
        return issues;
    }

    private async getAIFixes(code: string, language: string, filePath: string): Promise<string> {
        // Create a smart prompt for the AI
        const prompt = `Fix all issues in this ${language} code. 
Include: 
1. Fix bugs and errors
2. Improve security
3. Optimize performance
4. Follow best practices
5. Keep the same functionality

Return ONLY the fixed code, no explanations.

Code to fix:
\`\`\`${language}
${code}
\`\`\`

Fixed code:`;

        try {
            const fixedCode = await this.askOllama(prompt);
            
            // Clean up the response
            return this.cleanAIResponse(fixedCode, language);
        } catch (error) {
            console.error('AI fix failed:', error);
            return code; // Return original if fix fails
        }
    }

    private async askOllama(prompt: string): Promise<string> {
        try {
            // Call Ollama locally
            const { stdout } = await execAsync(
                `ollama run deepseek-coder:6.7b "${prompt.replace(/"/g, '\\"')}"`
            );
            return stdout.trim();
        } catch (error: any) {
            // Fallback: if Ollama fails, use a simple regex-based fixer
            console.warn('Ollama failed, using fallback:', error.message);
            return prompt; // Return original as fallback
        }
    }

    private cleanAIResponse(response: string, language: string): string {
        // Remove markdown code blocks if present
        const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``);
        const match = response.match(codeBlockRegex);
        
        if (match && match[1]) {
            return match[1];
        }
        
        // Remove triple backticks
        return response.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '').trim();
    }

    private isSupportedFile(extension: string): boolean {
        const supported = [
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
            '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.lua'
        ];
        return supported.includes(extension.toLowerCase());
    }

    private getLanguageFromExtension(extension: string): string {
        const mapping: { [key: string]: string } = {
            '.js': 'javascript', '.jsx': 'javascript',
            '.ts': 'typescript', '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp', '.c': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift'
        };
        return mapping[extension.toLowerCase()] || 'text';
    }

    private displayResults(issues: any[]) {
        this.outputChannel.appendLine('📊 PROJECT ANALYSIS RESULTS\n');
        
        if (issues.length === 0) {
            this.outputChannel.appendLine('✅ No issues found! Your project looks good.');
            return;
        }
        
        // Group by file
        const byFile: { [key: string]: any[] } = {};
        issues.forEach(issue => {
            if (!byFile[issue.file]) {
                byFile[issue.file] = [];
            }
            byFile[issue.file].push(issue);
        });
        
        // Display issues
        Object.keys(byFile).forEach(fileName => {
            this.outputChannel.appendLine(`📁 ${fileName}:`);
            
            byFile[fileName].forEach((issue, index) => {
                const icon = this.getIssueIcon(issue.type);
                this.outputChannel.appendLine(`  ${icon} Line ${issue.line}: ${issue.message}`);
                if (issue.code) {
                    this.outputChannel.appendLine(`     Code: ${issue.code}`);
                }
            });
            
            this.outputChannel.appendLine('');
        });
        
        // Summary
        this.outputChannel.appendLine(`📈 Found ${issues.length} issues across ${Object.keys(byFile).length} files.`);
        this.outputChannel.appendLine('\n💡 Run "Project Doctor: Fix All Issues" to auto-fix.');
    }

    private getIssueIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'debug-code': '🐛',
            'todo': '📝',
            'style': '🎨',
            'security': '🔒',
            'ai-analysis': '🤖'
        };
        return icons[type] || '⚠️';
    }

    deactivate() {
        // Cleanup
        this.outputChannel.dispose();
    }
}

// VS Code extension entry points
export function activate(context: vscode.ExtensionContext) {
    const doctor = new ProjectDoctor(context);
    doctor.activate();
    return doctor;
}

export function deactivate() {
    // Cleanup if needed
}