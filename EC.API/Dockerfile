FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /out .
COPY ECContent ./ECContent

ENV ASPNETCORE_URLS=http://+:${PORT}

ENTRYPOINT ["dotnet", "EC.API.dll"]
