using ABCPharmacy.Models;
using ABCPharmacy.Services;
using Microsoft.AspNetCore.Mvc;

namespace ABCPharmacy.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicinesController : ControllerBase
{
    private readonly JsonDataService _dataService;

    public MedicinesController(JsonDataService dataService)
    {
        _dataService = dataService;
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] string? search)
    {
        var medicines = _dataService.GetData().Medicines.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            medicines = medicines.Where(m =>
                m.FullName.Contains(search, StringComparison.OrdinalIgnoreCase)
            );
        }

        return Ok(medicines.OrderBy(m => m.FullName));
    }

    [HttpPost]
    public IActionResult Add([FromBody] Medicine medicine)
    {
        if (string.IsNullOrWhiteSpace(medicine.FullName))
            return BadRequest("Full Name is required.");

        if (string.IsNullOrWhiteSpace(medicine.Brand))
            return BadRequest("Brand is required.");

        if (medicine.Quantity < 0)
            return BadRequest("Quantity cannot be negative.");

        if (medicine.Price < 0)
            return BadRequest("Price cannot be negative.");

        if (medicine.ExpiryDate.Date < DateTime.Today)
            return BadRequest("Expiry date cannot be in the past.");

        return Created("", _dataService.AddMedicine(medicine));
    }

    [HttpPost("{id:int}/sell")]
    public IActionResult Sell(int id, [FromBody] SaleRequest request)
    {
        try
        {
            return Ok(_dataService.AddSale(id, request.Quantity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class SaleRequest
{
    public int Quantity { get; set; }
}
