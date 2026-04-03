
using Microsoft.Extensions.Configuration;
using System.Data;
using Npgsql;

public class DataContext
{
   private readonly IConfiguration _configuration;
   private readonly string _connectionString;

   public DataContext(IConfiguration configuration)
   {
      _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
      _connectionString = _configuration.GetConnectionString("DBConnection") ?? throw new InvalidOperationException("Missing connection string.");
   }
   public IDbConnection CreateConnection => new NpgsqlConnection(_connectionString);
}
