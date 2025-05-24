import { useState, useCallback } from "react";
import {
  Play,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Bug,
  Github,
  RotateCcw,
  Settings,
  HelpCircle,
  RefreshCwOff,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StdErrNotification } from "@/lib/notificationTypes";
import {
  LoggingLevel,
  LoggingLevelSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InspectorConfig } from "@/lib/configurationTypes";
import { ConnectionStatus } from "@/lib/constants";
import useTheme from "../lib/hooks/useTheme";
import { version } from "../../package.json";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from "../lib/hooks/useToast";

interface SidebarProps {
  connectionStatus: ConnectionStatus;
  transportType: "sse" | "streamable-http";
  setTransportType: (type: "sse" | "streamable-http") => void;
  sseUrl: string;
  setSseUrl: (url: string) => void;
  bearerToken: string;
  setBearerToken: (token: string) => void;
  headerName?: string;
  setHeaderName?: (name: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  stdErrNotifications: StdErrNotification[];
  clearStdErrNotifications: () => void;
  logLevel: LoggingLevel;
  sendLogLevelRequest: (level: LoggingLevel) => void;
  loggingSupported: boolean;
  config: InspectorConfig;
  setConfig: (config: InspectorConfig) => void;
}

const Sidebar = ({
  connectionStatus,
  transportType,
  setTransportType,
  sseUrl,
  setSseUrl,
  bearerToken,
  setBearerToken,
  headerName,
  setHeaderName,
  onConnect,
  onDisconnect,
  stdErrNotifications,
  clearStdErrNotifications,
  logLevel,
  sendLogLevelRequest,
  loggingSupported,
  config,
  setConfig,
}: SidebarProps) => {
  const [theme, setTheme] = useTheme();
  const [showBearerToken, setShowBearerToken] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [copiedServerEntry, setCopiedServerEntry] = useState(false);
  const [copiedServerFile, setCopiedServerFile] = useState(false);
  const { toast } = useToast();

  // Reusable error reporter for copy actions
  const reportError = useCallback(
    (error: unknown) => {
      toast({
        title: "Error",
        description: `Failed to copy config: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    },
    [toast],
  );

  // Shared utility function to generate server config
  const generateServerConfig = useCallback(() => {
    if (transportType === "sse") {
      return {
        type: "sse",
        url: sseUrl,
        note: "For SSE connections, add this URL directly in your MCP Client",
      };
    }
    if (transportType === "streamable-http") {
      return {
        type: "streamable-http",
        url: sseUrl,
        note: "For Streamable HTTP connections, add this URL directly in your MCP Client",
      };
    }
    return {};
  }, [transportType, sseUrl]);

  // Memoized config entry generator
  const generateMCPServerEntry = useCallback(() => {
    return JSON.stringify(generateServerConfig(), null, 4);
  }, [generateServerConfig]);

  // Memoized config file generator
  const generateMCPServerFile = useCallback(() => {
    return JSON.stringify(
      {
        mcpServers: {
          "default-server": generateServerConfig(),
        },
      },
      null,
      4,
    );
  }, [generateServerConfig]);

  // Memoized copy handlers
  const handleCopyServerEntry = useCallback(() => {
    try {
      const configJson = generateMCPServerEntry();
      navigator.clipboard
        .writeText(configJson)
        .then(() => {
          setCopiedServerEntry(true);

          toast({
            title: "Config entry copied",
            description:
              "SSE/Streamable HTTP URL has been copied. Use this URL directly in your MCP Client.", // Updated message
          });

          setTimeout(() => {
            setCopiedServerEntry(false);
          }, 2000);
        })
        .catch((error) => {
          reportError(error);
        });
    } catch (error) {
      reportError(error);
    }
  }, [generateMCPServerEntry, toast, reportError]);

  const handleCopyServerFile = useCallback(() => {
    try {
      const configJson = generateMCPServerFile();
      navigator.clipboard
        .writeText(configJson)
        .then(() => {
          setCopiedServerFile(true);

          toast({
            title: "Servers file copied",
            description:
              "Servers configuration has been copied to clipboard. Add this to your mcp.json file. Current testing server will be added as 'default-server'",
          });

          setTimeout(() => {
            setCopiedServerFile(false);
          }, 2000);
        })
        .catch((error) => {
          reportError(error);
        });
    } catch (error) {
      reportError(error);
    }
  }, [generateMCPServerFile, toast, reportError]);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <h1 className="ml-2 text-lg font-semibold">
            MCP Inspector v{version}
          </h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="transport-type-select"
            >
              Transport Type
            </label>
            <Select
              value={transportType}
              onValueChange={(value: "sse" | "streamable-http") => setTransportType(value)}
            >
              <SelectTrigger id="transport-type-select">
                <SelectValue placeholder="Select transport type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sse">SSE</SelectItem>
                <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="sse-url-input">
              URL
            </label>
            <Input
              id="sse-url-input"
              placeholder="URL"
              value={sseUrl}
              onChange={(e) => setSseUrl(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowBearerToken(!showBearerToken)}
              className="flex items-center w-full"
              data-testid="auth-button"
              aria-expanded={showBearerToken}
            >
              {showBearerToken ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              Authentication
            </Button>
            {showBearerToken && (
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Header Name</label>
                <Input
                  placeholder="Authorization"
                  onChange={(e) =>
                    setHeaderName && setHeaderName(e.target.value)
                  }
                  data-testid="header-input"
                  className="font-mono"
                  value={headerName ?? "Authorization"}
                />
                <label
                  className="text-sm font-medium"
                  htmlFor="bearer-token-input"
                >
                  Bearer Token
                </label>
                <Input
                  id="bearer-token-input"
                  placeholder="Bearer Token"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  data-testid="bearer-token-input"
                  className="font-mono"
                  type="password"
                />
              </div>
            )}
          </div>

          {/* Always show both copy buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyServerEntry}
                  className="w-full"
                >
                  {copiedServerEntry ? (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Server Entry
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Server Entry</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyServerFile}
                  className="w-full"
                >
                  {copiedServerFile ? (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Servers File
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Servers File</TooltipContent>
            </Tooltip>
          </div>

          {/* Configuration */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center w-full"
              data-testid="config-button"
              aria-expanded={showConfig}
            >
              {showConfig ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </Button>
            {showConfig && (
              <div className="space-y-2 pt-2">
                {Object.entries(config).map(([key, configItem]) => {
                  const configKey = key as keyof InspectorConfig;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-1">
                        <label
                          className="text-sm font-medium text-green-600 break-all"
                          htmlFor={`${configKey}-input`}
                        >
                          {configItem.label}
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {configItem.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {typeof configItem.value === "number" ? (
                        <Input
                          id={`${configKey}-input`}
                          type="number"
                          data-testid={`${configKey}-input`}
                          value={configItem.value}
                          onChange={(e) => {
                            const newConfig = { ...config };
                            newConfig[configKey] = {
                              ...configItem,
                              value: Number(e.target.value),
                            };
                            setConfig(newConfig);
                          }}
                          className="font-mono"
                        />
                      ) : typeof configItem.value === "boolean" ? (
                        <Select
                          data-testid={`${configKey}-select`}
                          value={configItem.value.toString()}
                          onValueChange={(val) => {
                            const newConfig = { ...config };
                            newConfig[configKey] = {
                              ...configItem,
                              value: val === "true",
                            };
                            setConfig(newConfig);
                          }}
                        >
                          <SelectTrigger id={`${configKey}-input`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`${configKey}-input`}
                          data-testid={`${configKey}-input`}
                          value={configItem.value}
                          onChange={(e) => {
                            const newConfig = { ...config };
                            newConfig[configKey] = {
                              ...configItem,
                              value: e.target.value,
                            };
                            setConfig(newConfig);
                          }}
                          className="font-mono"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {connectionStatus === "connected" && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  data-testid="connect-button"
                  onClick={() => {
                    onDisconnect();
                    onConnect();
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
                <Button onClick={onDisconnect}>
                  <RefreshCwOff className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            )}
            {connectionStatus !== "connected" && (
              <Button className="w-full" onClick={onConnect}>
                <Play className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${(() => {
                  switch (connectionStatus) {
                    case "connected":
                      return "bg-green-500";
                    case "error":
                      return "bg-red-500";
                    case "error-connecting-to-proxy":
                      return "bg-red-500";
                    default:
                      return "bg-gray-500";
                  }
                })()}`}
              />
              <span className="text-sm text-gray-600">
                {(() => {
                  switch (connectionStatus) {
                    case "connected":
                      return "Connected";
                    case "error":
                      return "Connection Error, is your MCP server running?";
                    case "error-connecting-to-proxy":
                      return "Error Connecting to MCP Inspector Proxy - Check Console logs";
                    default:
                      return "Disconnected";
                  }
                })()}
              </span>
            </div>

            {loggingSupported && connectionStatus === "connected" && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="logging-level-select"
                >
                  Logging Level
                </label>
                <Select
                  value={logLevel}
                  onValueChange={(value: LoggingLevel) =>
                    sendLogLevelRequest(value)
                  }
                >
                  <SelectTrigger id="logging-level-select">
                    <SelectValue placeholder="Select logging level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LoggingLevelSchema.enum).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {stdErrNotifications.length > 0 && (
              <>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">
                      Error output from MCP server
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearStdErrNotifications}
                      className="h-8 px-2"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="mt-2 max-h-80 overflow-y-auto">
                    {stdErrNotifications.map((notification, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-500 font-mono py-2 border-b border-gray-200 last:border-b-0"
                      >
                        {notification.params.content}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Select
            value={theme}
            onValueChange={(value: string) =>
              setTheme(value as "system" | "light" | "dark")
            }
          >
            <SelectTrigger className="w-[100px]" id="theme-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" title="Inspector Documentation" asChild>
              <a
                href="https://modelcontextprotocol.io/docs/tools/inspector"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CircleHelp className="w-4 h-4 text-foreground" />
              </a>
            </Button>
            <Button variant="ghost" title="Debugging Guide" asChild>
              <a
                href="https://modelcontextprotocol.io/docs/tools/debugging"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bug className="w-4 h-4 text-foreground" />
              </a>
            </Button>
            <Button
              variant="ghost"
              title="Report bugs or contribute on GitHub"
              asChild
            >
              <a
                href="https://github.com/modelcontextprotocol/inspector"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 text-foreground" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
