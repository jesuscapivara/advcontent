"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Loader2,
  Sparkles,
  Send,
  Instagram,
  Download,
  Image as ImageIcon,
  Plus,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toPng } from "html-to-image";
import download from "downloadjs";
import axios from "axios";
import { useFeed } from "@/lib/hooks/use-feed";
import { PostCard } from "@/components/feed/post-card";
import { ComplianceHUD } from "@/components/compliance/compliance-hud";
import { TextHighlighter } from "@/components/compliance/text-highlighter";
import {
  PostTemplateRenderer,
  TemplateId,
} from "@/components/editor/post-templates";
import { useTenantBranding } from "@/lib/hooks/use-tenant-branding";

const API_URL = "http://localhost:3333/api/v1/marketing/posts/draft";

type GenerateDraftPayload = {
  topic: string;
  tone: string;
  legalArea: string;
};

export default function EditorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Sóbrio");
  const [legalArea, setLegalArea] = useState("Civil");
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("modern-clean");

  const postRef = useRef<HTMLDivElement>(null);
  const { posts, isLoading: isLoadingFeed, refresh } = useFeed();
  const { branding, isLoading: isLoadingBranding } = useTenantBranding();

  const mutation = useMutation({
    mutationFn: async (data: GenerateDraftPayload) => {
      const response = await axios.post(API_URL, data, {
        headers: { "x-tenant-slug": "testing" },
      });
      return response.data;
    },
    onSuccess: () => {
      refresh(); // Atualiza o feed após gerar
      // Não fecha o gerador para o usuário ver o preview
    },
  });

  const generatedPost = mutation.data;

  const handleDownload = async () => {
    if (!postRef.current) {
      alert("Erro: Elemento não encontrado. Tente gerar o post novamente.");
      return;
    }

    if (!generatedPost) {
      alert("Erro: Nenhum post gerado. Gere um post primeiro.");
      return;
    }

    try {
      const dataUrl = await toPng(postRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      download(
        dataUrl,
        `post-${generatedPost.headline.slice(0, 20).replace(/\s/g, "-")}.png`
      );
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Erro ao baixar imagem. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Editorial</h1>
              <p className="text-slate-500 mt-1">
                Gerencie suas publicações e aprove sugestões.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refresh()}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Atualizar
              </Button>
              <Button onClick={() => setShowGenerator(!showGenerator)}>
                <Plus className="w-4 h-4 mr-2" /> Criar Novo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Gerador de Post (Colapsável) */}
        {showGenerator && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex h-full bg-slate-50 overflow-hidden font-sans">
              <aside className="w-[400px] border-r bg-white flex flex-col shadow-xl z-20">
                <div className="p-8 border-b bg-slate-50/50">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles
                      className="text-amber-500 fill-amber-500"
                      size={20}
                    />
                    Novo Post
                  </h2>
                </div>
                <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">
                      Pauta do Dia
                    </label>
                    <Textarea
                      placeholder="Ex: STF decide..."
                      className="h-32 resize-none bg-slate-50 text-base"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Área
                      </label>
                      <Select value={legalArea} onValueChange={setLegalArea}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Trabalhista">
                            Trabalhista
                          </SelectItem>
                          <SelectItem value="Criminal">Criminal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Tom
                      </label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sóbrio">Sóbrio</SelectItem>
                          <SelectItem value="Empatico">Empático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Template Visual
                    </label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={(value) =>
                        setSelectedTemplate(value as TemplateId)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic-serif">
                          Clássico Serifado
                        </SelectItem>
                        <SelectItem value="modern-clean">
                          Moderno Limpo
                        </SelectItem>
                        <SelectItem value="breaking-news">
                          Breaking News
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Compliance HUD */}
                  {generatedPost && (
                    <ComplianceHUD
                      text={`${generatedPost.headline} ${generatedPost.caption || ""}`}
                    />
                  )}
                </div>
                <div className="p-6 border-t bg-slate-50/50 flex flex-col gap-3">
                  <Button
                    className="w-full h-12 text-lg font-medium bg-slate-900 hover:bg-slate-800 shadow-lg"
                    disabled={!topic || mutation.isPending}
                    onClick={() => mutation.mutate({ topic, tone, legalArea })}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      "1. Gerar Post com IA"
                    )}
                  </Button>
                  {generatedPost && (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-lg border-slate-300 text-slate-700 hover:bg-slate-100"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      2. Baixar Imagem (PNG)
                    </Button>
                  )}
                </div>
              </aside>

              <main className="flex-1 flex items-center justify-center bg-slate-100 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                {generatedPost || mutation.isPending ? (
                  <div className="scale-90 md:scale-100 transition-all duration-500">
                    <div className="w-[375px] h-[750px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden flex flex-col relative">
                      <div className="h-14 border-b flex items-center justify-between px-5 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                          <span className="text-xs font-semibold">
                            {branding?.fullName || "advocacia.digital"}
                          </span>
                        </div>
                        <Instagram className="h-5 w-5 text-slate-800" />
                      </div>
                      <div className="flex-1 overflow-y-auto bg-white scrollbar-hide">
                        <div
                          ref={postRef}
                          className="aspect-square relative overflow-hidden"
                        >
                          {mutation.isPending ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse text-white">
                              Gerando Design...
                            </div>
                          ) : generatedPost ? (
                            <PostTemplateRenderer
                              templateId={selectedTemplate}
                              headline={generatedPost.headline}
                              category={legalArea}
                              caption={generatedPost.caption}
                              primaryColor={branding?.primaryColor || "#0f172a"}
                              secondaryColor={
                                branding?.secondaryColor || "#f59e0b"
                              }
                              logoUrl={branding?.logoUrl}
                              fontFamily={branding?.fontFamily}
                            />
                          ) : null}
                        </div>
                        <div className="px-4 py-3 flex gap-4">
                          <div className="w-6 h-6 rounded-full border-2 border-slate-900"></div>
                          <Send className="h-6 w-6 text-slate-900" />
                        </div>
                        <div className="px-4 pb-8">
                          <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {mutation.isPending ? (
                              "..."
                            ) : (
                              <TextHighlighter
                                text={generatedPost.caption || ""}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Preencha os dados ao lado.</p>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {/* Feed de Posts */}
        {isLoadingFeed ? (
          <div className="text-center py-20 text-slate-400">
            Carregando feed...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-slate-500">Nenhum post encontrado.</p>
            <p className="text-sm text-slate-400 mt-2">
              Suas sugestões devem chegar em instantes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.headline || post.title || "Sem título"}
                excerpt={
                  post.caption || post.content || "Sem descrição disponível"
                }
                status={post.status || "DRAFT"}
                date={post.createdAt || new Date().toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
