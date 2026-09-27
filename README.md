# ABC Pharmacy - ASP.NET Core Web API + JavaScript SPA

## Requirements
- .NET 10 SDK
- Any modern browser
- VS Code / Visual Studio (optional)

## Run from terminal

```bash
cd ABCPharmacy
dotnet restore
dotnet build
dotnet run
```

Open the URL printed by `dotnet run`, for example:
`http://localhost:5000`

## Features
- Medicine list
- Add medicine
- Search by medicine name or brand
- Red row when expiry is less than 30 days
- Yellow row when stock is below 10
- Sell medicine and automatically reduce stock
- Sales history
- All persistent data stored in `Data/pharmacy-data.json`

## API endpoints

GET    /api/medicines
GET    /api/medicines?search=para
POST   /api/medicines
POST   /api/medicines/{id}/sell
GET    /api/sales

## Important assignment note

The command in the assignment:

`dotnet new console --MyConsoleApp`

is not the correct syntax for creating a named console project.

For this Web API assignment, use:

`dotnet new webapi -n ABCPharmacy --framework net10.0`

This project already contains the complete Web API + SPA implementation, so you can simply run `dotnet build` and `dotnet run`.
