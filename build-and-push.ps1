
$GH_USERNAME = "KerelosNasser"
$IMAGE_NAME = "elkedeseen-bms"
$TAG = "latest"

Write-Host "🚀 Building Docker image..." -ForegroundColor Cyan
docker build -t ghcr.io/$GH_USERNAME/$IMAGE_NAME:$TAG .


Write-Host "🚢 Pushing image to registry..." -ForegroundColor Cyan
docker push ghcr.io/$GH_USERNAME/$IMAGE_NAME:$TAG

Write-Host "✅ Done! Tell your admin the image name: ghcr.io/$GH_USERNAME/$IMAGE_NAME:$TAG" -ForegroundColor Green
