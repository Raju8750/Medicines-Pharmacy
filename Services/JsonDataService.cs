using System.Text.Json;
using ABCPharmacy.Models;

namespace ABCPharmacy.Services;

public class JsonDataService
{
    private readonly string _filePath;
    private readonly object _lock = new();

    public JsonDataService(IWebHostEnvironment env)
    {
        var dataDirectory = Path.Combine(env.ContentRootPath, "Data");
        Directory.CreateDirectory(dataDirectory);
        _filePath = Path.Combine(dataDirectory, "pharmacy-data.json");

        if (!File.Exists(_filePath))
        {
            SaveData(new StoreData
            {
                Medicines = new List<Medicine>
                {
                    new()
                    {
                        Id = 1, FullName = "Paracetamol 500mg",
                        Notes = "For fever and pain relief",
                        ExpiryDate = DateTime.Today.AddMonths(8),
                        Quantity = 25, Price = 12.50m, Brand = "ABC Pharma"
                    },
                    new()
                    {
                        Id = 2, FullName = "Amoxicillin 500mg",
                        Notes = "Prescription medicine",
                        ExpiryDate = DateTime.Today.AddDays(20),
                        Quantity = 15, Price = 85.75m, Brand = "MediCare"
                    },
                    new()
                    {
                        Id = 3, FullName = "Vitamin C",
                        Notes = "Supplement",
                        ExpiryDate = DateTime.Today.AddMonths(10),
                        Quantity = 6, Price = 50.00m, Brand = "HealthPlus"
                    }
                }
            });
        }
    }

    public StoreData GetData()
    {
        lock (_lock)
        {
            return LoadData();
        }
    }

    public Medicine AddMedicine(Medicine medicine)
    {
        lock (_lock)
        {
            var data = LoadData();
            medicine.Id = data.Medicines.Count == 0
                ? 1
                : data.Medicines.Max(x => x.Id) + 1;

            medicine.FullName = medicine.FullName.Trim();
            medicine.Brand = medicine.Brand.Trim();
            medicine.Notes = medicine.Notes?.Trim() ?? "";

            data.Medicines.Add(medicine);
            SaveData(data);
            return medicine;
        }
    }

    public SaleRecord AddSale(int medicineId, int quantitySold)
    {
        lock (_lock)
        {
            var data = LoadData();
            var medicine = data.Medicines.FirstOrDefault(x => x.Id == medicineId);

            if (medicine is null)
                throw new InvalidOperationException("Medicine not found.");

            if (quantitySold <= 0)
                throw new InvalidOperationException("Sale quantity must be greater than zero.");

            if (quantitySold > medicine.Quantity)
                throw new InvalidOperationException("Sale quantity cannot exceed available stock.");

            medicine.Quantity -= quantitySold;

            var sale = new SaleRecord
            {
                Id = data.Sales.Count == 0 ? 1 : data.Sales.Max(x => x.Id) + 1,
                MedicineId = medicine.Id,
                MedicineName = medicine.FullName,
                QuantitySold = quantitySold,
                UnitPrice = medicine.Price,
                TotalAmount = medicine.Price * quantitySold,
                SaleDate = DateTime.Now
            };

            data.Sales.Add(sale);
            SaveData(data);
            return sale;
        }
    }

    private StoreData LoadData()
    {
        if (!File.Exists(_filePath))
            return new StoreData();

        var json = File.ReadAllText(_filePath);
        return JsonSerializer.Deserialize<StoreData>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? new StoreData();
    }

    private void SaveData(StoreData data)
    {
        var json = JsonSerializer.Serialize(data,
            new JsonSerializerOptions { WriteIndented = true });

        File.WriteAllText(_filePath, json);
    }
}
