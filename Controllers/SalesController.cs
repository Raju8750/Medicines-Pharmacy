using ABCPharmacy.Services;
using Microsoft.AspNetCore.Mvc;

namespace ABCPharmacy.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly JsonDataService _dataService;

    public SalesController(JsonDataService dataService)
    {
        _dataService = dataService;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_dataService.GetData().Sales.OrderByDescending(x => x.SaleDate));
    }
}
