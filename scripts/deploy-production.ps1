$ErrorActionPreference = "Stop"

docker network inspect splitter-internal *> $null
if ($LASTEXITCODE -ne 0) {
    docker network create splitter-internal
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to create Docker network splitter-internal."
    }
}

docker compose -f compose.production.yml up -d --build --remove-orphans
if ($LASTEXITCODE -ne 0) {
    throw "Frontend deployment failed."
}
