import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import {
  isOpenInferenceSpan,
  OpenInferenceSimpleSpanProcessor,
} from "@arizeai/openinference-vercel";
import { Metadata } from "@grpc/grpc-js";
import { OTLPTraceExporter as GrpcOTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {resourceFromAttributes} from "@opentelemetry/resources";
import {registerInstrumentations} from "@opentelemetry/instrumentation";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export function register() {

  const metadata = new Metadata();

  metadata.set("space_id", process.env.ARIZE_SPACE_ID || "");
  metadata.set("api_key", process.env.ARIZE_API_KEY || "");

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      model_id: "vercel-testing",
      model_version: "1.0.0"
    }),
    spanProcessors: [
        new OpenInferenceSimpleSpanProcessor({
          exporter: new GrpcOTLPTraceExporter({
            url: "https://otlp.arize.com",
            metadata
          }),
          // spanFilter: (span) => {
          //   return isOpenInferenceSpan(span);
          // }
        })
    ]
  });
  registerInstrumentations({});
  provider.register();
}