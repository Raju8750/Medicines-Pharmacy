namespace ABCPharmacy.Models;

public class StoreData
{
    public List<Medicine> Medicines { get; set; } = new();
    public List<SaleRecord> Sales { get; set; } = new();
}
