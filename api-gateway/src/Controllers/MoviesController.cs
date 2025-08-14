using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace APIGateway.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MoviesController> _logger;
    private readonly string _movieServiceUrl;
    private readonly string _recommendationServiceUrl;
    private readonly string _ratingServiceUrl;

    public MoviesController(
        IHttpClientFactory httpClientFactory, 
        ILogger<MoviesController> logger, 
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _movieServiceUrl = configuration["Services:MovieService"] ?? throw new ArgumentNullException("MovieService URL not configured");
        _recommendationServiceUrl = configuration["Services:RecommendationService"] ?? throw new ArgumentNullException("RecommendationService URL not configured");
        _ratingServiceUrl = configuration["Services:RatingService"] ?? throw new ArgumentNullException("RatingService URL not configured");
    }

    [HttpGet]
    public async Task<IActionResult> GetMovies([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{_movieServiceUrl}/api/movies?page={page}&limit={limit}&search={search}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(result));
            }
            
            return StatusCode((int)response.StatusCode, new { error = "Failed to fetch movies" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching movies");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovie(int id)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{_movieServiceUrl}/api/movies/{id}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(result));
            }
            
            return StatusCode((int)response.StatusCode, new { error = "Movie not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching movie with id {id}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("top-recommended")]
    public async Task<IActionResult> GetTopRecommended([FromQuery] string userId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{_recommendationServiceUrl}/api/recommendations/top?userId={userId}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(result));
            }
            
            return StatusCode((int)response.StatusCode, new { error = "Failed to fetch recommendations" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top recommendations");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("{id}/rate")]
    [Authorize]
    public async Task<IActionResult> RateMovie(int id, [FromBody] RateMovieRequest request)
    {
        try
        {
            // Get user ID from JWT token
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Invalid token" });
            }

            var client = _httpClientFactory.CreateClient();
            var content = new StringContent(
                JsonSerializer.Serialize(new { MovieId = id, UserId = userId, Rating = request.Rating, Comment = request.Comment }),
                Encoding.UTF8,
                "application/json"
            );

            var response = await client.PostAsync($"{_ratingServiceUrl}/api/ratings", content);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(result));
            }
            
            var errorContent = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, JsonDocument.Parse(errorContent));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error rating movie with id {id}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

public class RateMovieRequest
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
