using Dapper;
using System.Data;
using EC.API.Models;
using EC.API.Services;
namespace EC.API.Repositories;

public interface IDocumentRepository
{
    Task<List<Document>> GetDocuments(string AssociatedId = "", string AssociatedType = "");
    Task<PagedResultDto<List<Document>>> GetAllGetDocuments(string DocumentId, string AssociatedId, string AssociatedType, int PageIndex = 0, int PageSize = 0);
    Task<Document> GetDocumentById(int DocumentId);
    Task<int> AddUpdateDocument(Document objModel);
    Task<int> DeleteDocumentById(int DocumentId, string AssociatedType = "");
    Task<int> AddProductDocumentWithFile(int ProductId, int TenantId, IFormFile[] ImportFile, string AssociatedType = "");
    Task<int> AddProductVariantDocumentWithFile(int ProductId, int VariantId, IFormFile ImportFile, string AssociatedType = "");
}
public class DocumentRepository : IDocumentRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    private readonly IConfiguration _configuration;
    public DocumentRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository, IConfiguration configuration)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
        _configuration = configuration;
    }
    public async Task<List<Document>> GetDocuments(string AssociatedId = "", string AssociatedType = "")
    {
        try
        {
            var objResp = new List<Document>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT * FROM p_get_documents(@AssociatedId, @AssociatedType)";
                var param = new DynamicParameters();
                param.Add("@AssociatedId", string.IsNullOrEmpty(AssociatedId) ? null : (object)AssociatedId);
                param.Add("@AssociatedType", string.IsNullOrEmpty(AssociatedType) ? null : (object)AssociatedType);
                var result = await con.QueryAsync<Document>(query, param);
                objResp = result.ToList();
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("DocumentRepository => GetDocuments =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Document>>> GetAllGetDocuments(string DocumentId, string AssociatedId, string AssociatedType, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Document>>();
            List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
            List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "p_GET_Documents";
                var param = new DynamicParameters();
                int? documentIdParam = string.IsNullOrEmpty(DocumentId) ? null : int.Parse(DocumentId);
                param.Add("@DocumentId", documentIdParam);
                param.Add("@AssociatedId", string.IsNullOrEmpty(AssociatedId) ? null : (object)AssociatedId);
                param.Add("@AssociatedType", string.IsNullOrEmpty(AssociatedType) ? null : (object)AssociatedType);
                int? pageSize = PageSize > 0 ? PageSize : (int?)null;
                int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
                param.Add("@PageSize", pageSize);
                param.Add("@PageIndex", pageIndex);
                var result = await con.QueryAsync<Document>(query, param);
                if (result == null) return null;
                int count = 0;
                if (result.Count() > 0)
                {
                    var elm = result.First();
                    count = Convert.ToInt32(elm.TotalRowCount);
                    lstColumnDetail = _gridDataHelperRepository.GetDocumentsColumnDetails();
                    lstFilterDetail = _gridDataHelperRepository.GetDocumentsFilterDetails();
                }
                objResp = new PagedResultDto<List<Document>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("DocumentRepository => GetAllGetDocuments =>", ex);
            throw;
        }
    }
    public async Task<Document> GetDocumentById(int DocumentId)
    {
        try
        {
            var objResp = new Document();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "p_GET_Documents";
                var param = new DynamicParameters();
                param.Add("@DocumentId", DocumentId);
                var _result = await con.QueryAsync<Document>(query, param);
                objResp = _result.FirstOrDefault();
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("DocumentRepository => GetDocumentById =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateDocument(Document objModel)
    {
        try
        {
            int DocumentId = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@DocumentId", (long?)objModel.DocumentId);
                param.Add("@DocumentType", string.IsNullOrEmpty(objModel.DocumentType) ? null : (object)objModel.DocumentType);
                param.Add("@FileName", string.IsNullOrEmpty(objModel.FileName) ? null : (object)objModel.FileName);
                param.Add("@FileUrl", string.IsNullOrEmpty(objModel.FileUrl) ? null : (object)objModel.FileUrl);
                param.Add("@PhysicalFileUrl", string.IsNullOrEmpty(objModel.PhysicalFileUrl) ? null : (object)objModel.PhysicalFileUrl);
                param.Add("@AssociatedId", (long?)objModel.AssociatedId);
                param.Add("@AssociatedType", string.IsNullOrEmpty(objModel.AssociatedType) ? null : (object)objModel.AssociatedType);
                param.Add("@TenantId", (long?)objModel.TenantId);
                param.Add("@Flag", objModel.Flag);
                DocumentId = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_documents(
                        p_documentid => @DocumentId::bigint,
                        p_documenttype => @DocumentType::character varying,
                        p_filename => @FileName::character varying,
                        p_fileurl => @FileUrl::text,
                        p_physicalfileurl => @PhysicalFileUrl::text,
                        p_associatedid => @AssociatedId::bigint,
                        p_associatedtype => @AssociatedType::character varying,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
            return DocumentId;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("DocumentRepository => AddUpdateDocument =>", ex);
            throw;
        }
    }
    public async Task<int> DeleteDocumentById(int DocumentId, string AssociatedType = "")
    {
        try
        {
            int _documentId = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@DocumentId", (long?)DocumentId);
                param.Add("@AssociatedType", string.IsNullOrEmpty(AssociatedType) ? null : (object)AssociatedType);
                param.Add("@TenantId", (long?)null);
                param.Add("@Flag", 3);
                _documentId = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_documents(
                        p_documentid => @DocumentId::bigint,
                        p_documenttype => NULL::character varying,
                        p_filename => NULL::character varying,
                        p_fileurl => NULL::text,
                        p_physicalfileurl => NULL::text,
                        p_associatedid => NULL::bigint,
                        p_associatedtype => @AssociatedType::character varying,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
            return _documentId;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("DocumentRepository => DeleteDocumentById =>", ex);
            throw;
        }
    }

    public async Task<int> AddProductDocumentWithFile(int ProductId, int TenantId, IFormFile[] ImportFile, string AssociatedType = "")
    {
        int DocumentId = 0;
        try
        {
            var contentFolderPath = _configuration["AppSettings:ContentFolderPath"];
            var baseUrl = _configuration["AppSettings:ContentURL"];
            string directoryPath = Path.Combine(contentFolderPath, "Products", ProductId.ToString());
            string baseFileUrl = baseUrl + "/Products/" + ProductId;
            if (!Directory.Exists(directoryPath)) { Directory.CreateDirectory(directoryPath); }
            string _guid = Convert.ToString(Guid.NewGuid()).Replace("-", string.Empty);
            foreach (var file in ImportFile)
            {
                var FileName = _guid + "_" + file.FileName;
                var PhysicalFileUrl = Path.Combine(directoryPath, _guid + "_" + file.FileName);
                var FileUrl = baseFileUrl + "/" + _guid + "_" + file.FileName;
                await using (var stream = new FileStream(PhysicalFileUrl, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                var DocumentType = FileTypeHelper.GetFileType(file.FileName);
                using (var con = _datacontext.CreateConnection)
                {
                    var param = new DynamicParameters();
                    param.Add("@DocumentId", (long?)null);
                    param.Add("@DocumentType", string.IsNullOrEmpty(DocumentType) ? null : (object)DocumentType);
                    param.Add("@FileName", string.IsNullOrEmpty(FileName) ? null : (object)FileName);
                    param.Add("@FileUrl", string.IsNullOrEmpty(FileUrl) ? null : (object)FileUrl);
                    param.Add("@PhysicalFileUrl", string.IsNullOrEmpty(PhysicalFileUrl) ? null : (object)PhysicalFileUrl);
                    param.Add("@AssociatedId", (long?)ProductId);
                    param.Add("@AssociatedType", string.IsNullOrEmpty(AssociatedType) ? null : (object)AssociatedType);
                    param.Add("@TenantId", (long?)TenantId);
                    param.Add("@Flag", 1);
                    DocumentId = await con.ExecuteScalarAsync<int>(
                        @"SELECT p_aud_documents(
                            p_documentid => @DocumentId::bigint,
                            p_documenttype => @DocumentType::character varying,
                            p_filename => @FileName::character varying,
                            p_fileurl => @FileUrl::text,
                            p_physicalfileurl => @PhysicalFileUrl::text,
                            p_associatedid => @AssociatedId::bigint,
                            p_associatedtype => @AssociatedType::character varying,
                            p_tenantid => @TenantId::bigint,
                            p_flag => @Flag::integer
                        )", param);
                }
            }
        }
        catch (Exception ex)
        {
            DocumentId = 0;
            _logger.LogLocationWithException("DocumentRepository => AddProductDocumentWithFile =>", ex);
        }
        return DocumentId;
    }

    public async Task<int> AddProductVariantDocumentWithFile(int ProductId, int VariantId, IFormFile file, string AssociatedType)
    {
        int DocumentId = 0;
        try
        {
            var contentFolderPath = _configuration["AppSettings:ContentFolderPath"];
            var baseUrl = _configuration["AppSettings:ContentURL"];
            string directoryPath = Path.Combine(contentFolderPath, "Products", ProductId.ToString(), VariantId.ToString());
            string baseFileUrl = baseUrl + "/Products/" + ProductId + "/" + VariantId;
            if (!Directory.Exists(directoryPath)) { Directory.CreateDirectory(directoryPath); }
            string _guid = Convert.ToString(Guid.NewGuid()).Replace("-", string.Empty);
            var FileName = _guid + "_" + file.FileName;
            var PhysicalFileUrl = Path.Combine(directoryPath, _guid + "_" + file.FileName);
            var FileUrl = baseFileUrl + "/" + _guid + "_" + file.FileName;
            await using (var stream = new FileStream(PhysicalFileUrl, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var DocumentType = FileTypeHelper.GetFileType(file.FileName);
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@DocumentId", (long?)null);
                param.Add("@DocumentType", string.IsNullOrEmpty(DocumentType) ? null : (object)DocumentType);
                param.Add("@FileName", string.IsNullOrEmpty(FileName) ? null : (object)FileName);
                param.Add("@FileUrl", string.IsNullOrEmpty(FileUrl) ? null : (object)FileUrl);
                param.Add("@PhysicalFileUrl", string.IsNullOrEmpty(PhysicalFileUrl) ? null : (object)PhysicalFileUrl);
                param.Add("@AssociatedId", (long?)VariantId);
                param.Add("@AssociatedType", string.IsNullOrEmpty(AssociatedType) ? null : (object)AssociatedType);
                param.Add("@TenantId", (long?)null);
                param.Add("@Flag", 1);
                DocumentId = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_documents(
                        p_documentid => @DocumentId::bigint,
                        p_documenttype => @DocumentType::character varying,
                        p_filename => @FileName::character varying,
                        p_fileurl => @FileUrl::text,
                        p_physicalfileurl => @PhysicalFileUrl::text,
                        p_associatedid => @AssociatedId::bigint,
                        p_associatedtype => @AssociatedType::character varying,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
        }
        catch (Exception ex)
        {
            DocumentId = 0;
            _logger.LogLocationWithException("DocumentRepository => AddProductVariantDocumentWithFile =>", ex);
        }
        return DocumentId;
    }
}
