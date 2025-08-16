using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.EntityFrameworkCore;
using CmsService.Data;      // Reference CmsDbContext
using CmsService.Services;  // Reference service interfaces

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CMS Service", Version = "v1" });
    // Add JWT Authentication to Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Enter JWT Bearer token **_only_**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {securityScheme, Array.Empty<string>()}
    });
});

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string not configured");
builder.Services.AddDbContext<CmsDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Add services
builder.Services.AddScoped<ICountryService, CmsService.Services.CountryService>();
builder.Services.AddScoped<ILanguageService, CmsService.Services.LanguageService>();
builder.Services.AddScoped<IGenreService, CmsService.Services.GenreService>();
builder.Services.AddScoped<IFileUploadService, CmsService.Services.FileUploadService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Create a scope to resolve services
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<CmsDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Check if migrations are available by checking if the Design package is loaded
        var isMigrationsAvailable = IsMigrationsAvailable();
        
        if (isMigrationsAvailable)
        {
            // Migrations are available, apply them
            logger.LogInformation("Migrations are enabled. Applying pending migrations...");
            await context.Database.MigrateAsync();
            logger.LogInformation("Migrations applied successfully.");
        }
        else
        {
            // Migrations are not available, just ensure the database is created
            logger.LogInformation("Migrations are not enabled. Ensuring database exists...");
            await context.Database.EnsureCreatedAsync();
            logger.LogInformation("Database ensured.");
        }
        
        // Seed initial data if needed
        if (!await context.Countries.AnyAsync())
        {
            logger.LogInformation("Seeding initial data...");
            await CmsDbContext.SeedData(context);
            logger.LogInformation("Initial data seeded successfully.");
        }
        else
        {
            logger.LogInformation("Database already contains data. Skipping seeding.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database initialization.");
        
        // Fallback: just ensure the database exists
        try
        {
            await context.Database.EnsureCreatedAsync();
            logger.LogInformation("Database created as fallback.");
            
            // Try to seed data if needed
            if (!await context.Countries.AnyAsync())
            {
                logger.LogInformation("Attempting to seed data as fallback...");
                await CmsDbContext.SeedData(context);
                logger.LogInformation("Initial data seeded as fallback.");
            }
        }
        catch (Exception fallbackEx)
        {
            logger.LogError(fallbackEx, "Fallback database initialization failed. The application may not work correctly.");
        }
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoints
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/ready", async (CmsDbContext context) =>
{
    try
    {
        await context.Database.CanConnectAsync();
        return Results.Ok(new { status = "ready" });
    }
    catch
    {
        return Results.Problem("Database not available");
    }
});

app.Run();

// Helper method to check if migrations are available
static bool IsMigrationsAvailable()
{
    try
    {
        // Try to load the Entity Framework Core Design assembly
        var designAssembly = System.AppDomain.CurrentDomain.GetAssemblies()
            .FirstOrDefault(a => a.FullName?.Contains("EntityFrameworkCore.Design") == true);
        
        return designAssembly != null;
    }
    catch
    {
        return false;
    }
}
