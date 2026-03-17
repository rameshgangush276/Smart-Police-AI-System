# GitHub Deployment Script for Smart Police App

$repoName = "smart-ai-case-management-system"
$githubUser = "rameshgangush276" # Based on workspace info

Write-Host "Checking for Git..." -ForegroundColor Cyan
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH. Please install Git to continue."
    exit
}

Write-Host "Initializing Git Repository..." -ForegroundColor Cyan
if (!(Test-Path .git)) {
    git init
    git branch -M main
}

Write-Host "Adding Files..." -ForegroundColor Cyan
git add .

Write-Host "Creating First Commit..." -ForegroundColor Cyan
git commit -m "Initial commit: AI-Powered Smart Police Case Management System"

Write-Host "Checking GitHub CLI..." -ForegroundColor Cyan
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "Connecting to GitHub via 'gh' CLI..." -ForegroundColor Yellow
    gh repo create $repoName --public --source=. --push
} else {
    Write-Host "GitHub CLI (gh) not found. Attempting manual push..." -ForegroundColor Yellow
    Write-Host "Please ensure you have created the repository '$repoName' on GitHub."
    $remoteUrl = "https://github.com/$githubUser/$repoName.git"
    git remote add origin $remoteUrl
    git push -u origin main
}

Write-Host "Deployment to GitHub Complete!" -ForegroundColor Green
