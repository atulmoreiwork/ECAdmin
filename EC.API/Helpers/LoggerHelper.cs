using NLog;
using System;
using System.Text;
public static class LoggerHelper
{
    private static NLog.ILogger logger = LogManager.GetCurrentClassLogger();
    public static void LogInfo(string message) => logger.Info(message);
    public static void LogWarn(string message) => logger.Warn(message);
    public static void LogDebug(string message) => logger.Debug(message);
    public static void LogError(string message) => logger.Error(message);
    public static void LogLocationWithException(string location, Exception ex)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("Location: " + location);
        sb.AppendLine("Error log: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss.fff tt"));
        sb.AppendLine("Associated exception message: " + ex.Message);
        sb.AppendLine("Exception Inner: " + ex.InnerException);
        sb.AppendLine("Exception class: " + ex.GetType().ToString());
        sb.AppendLine("Exception source: " + ex.Source.ToString());
        sb.AppendLine("Exception method: " + ex.TargetSite.Name.ToString());
        sb.AppendLine("Exception Stack Trace : " + ex.StackTrace);
        logger.Error(sb.ToString());
    }
    public static void LogException(Exception ex)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("Error log: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss.fff tt"));
        sb.AppendLine("Associated exception message: " + ex.Message);
        sb.AppendLine("Exception Inner: " + ex.InnerException);
        sb.AppendLine("Exception class: " + ex.GetType().ToString());
        sb.AppendLine("Exception source: " + ex.Source.ToString());
        sb.AppendLine("Exception method: " + ex.TargetSite.Name.ToString());
        sb.AppendLine("Exception Stack Trace : " + ex.StackTrace);
        logger.Error(sb.ToString());
    }      
}