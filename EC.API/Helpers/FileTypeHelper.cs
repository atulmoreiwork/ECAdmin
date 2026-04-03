using System;
using System.Collections.Generic;
using System.IO;

public class FileTypeHelper
{
    // Dictionary to map file extensions to file types
    private static readonly Dictionary<string, string> FileTypeMappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { ".jpg", "Image" },
        { ".jpeg", "Image" },
        { ".png", "Image" },
        { ".gif", "Image" },
        { ".bmp", "Image" },
        { ".pdf", "Pdf" },
        { ".doc", "Document" },
        { ".docx", "Document" },
        { ".xls", "Spreadsheet" },
        { ".xlsx", "Spreadsheet" },
        { ".ppt", "Presentation" },
        { ".pptx", "Presentation" },
        { ".txt", "Text" },
        { ".zip", "Compressed" },
        { ".rar", "Compressed" },
        { ".mp3", "Audio" },
        { ".wav", "Audio" },
        { ".mp4", "Video" },
        { ".avi", "Video" },
        { ".mkv", "Video" },
        { ".exe", "Executable" },
        { ".html", "Web File" },
        { ".css", "Web File" },
        { ".js", "Web File" }
    };

    // Method to get file type based on extension
    public static string GetFileType(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be null or empty.", nameof(fileName));

        string extension = Path.GetExtension(fileName);

        if (string.IsNullOrEmpty(extension))
            return "Unknown";

        return FileTypeMappings.TryGetValue(extension, out string fileType) ? fileType : "Unknown";
    }
}
