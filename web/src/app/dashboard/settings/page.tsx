"use client";

import React, { useEffect, useState } from "react";
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Save, 
  Plus, 
  Trash2, 
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Globe,
  Layout
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ImageUpload } from "@/components/ui/ImageUpload";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
}

export default function VitrineEditor() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "gallery">("content");
  
  const [formData, setFormData] = useState({
    slogan: "",
    description: "",
    themeColor: "#50C9CE",
    logoUrl: "",
    bannerUrl: "",
  });

  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [newImage, setNewImage] = useState({ url: "", caption: "" });

  const fetchVitrine = async () => {
    if (!user?.companyId) return;
    try {
      const response = await api.get(`/companies`);
      const currentCompany = response.data.data.find((c: any) => c.id === user.companyId);
      
      if (currentCompany) {
        const detailRes = await api.get(`/companies/${currentCompany.slug}`);
        const data = detailRes.data.data;
        setFormData({
          slogan: data.slogan || "",
          description: data.description || "",
          themeColor: data.themeColor || "#50C9CE",
          logoUrl: data.logoUrl || "",
          bannerUrl: data.bannerUrl || "",
        });
        setGallery(data.gallery || []);
      }
    } catch (err) {
      console.error("Erreur chargement vitrine", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitrine();
  }, [user?.companyId]);

  const handleSaveVitrine = async () => {
    setSaving(true);
    try {
      await api.patch(`/companies/${user?.companyId}/vitrine`, formData);
      toast.success("Votre vitrine a été mise à jour !");
    } catch (err) {
      toast.error("Échec de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddGalleryImage = async () => {
    if (!newImage.url) return;
    try {
      await api.post(`/companies/${user?.companyId}/gallery`, {
        imageUrl: newImage.url,
        caption: newImage.caption
      });
      setNewImage({ url: "", caption: "" });
      fetchVitrine();
      toast.success("Image ajoutée à votre galerie.");
    } catch (err) {
      toast.error("Erreur lors de l'ajout.");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await api.delete(`/companies/${user?.companyId}/gallery/${imageId}`);
      fetchVitrine();
      toast.info("Image supprimée.");
    } catch (err) {
      console.error("Erreur suppression image", err);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Éditeur de Vitrine</h2>
          <p className="text-foreground/40 font-medium">Personnalisez votre image de marque sur la plateforme.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6" onClick={() => window.open(`/compagnies/${user?.name.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}>
            <Globe className="w-4 h-4 mr-2" /> Voir en ligne
          </Button>
          <Button 
            className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
            isLoading={saving}
            onClick={handleSaveVitrine}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <button 
            onClick={() => setActiveTab("content")}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-left",
              activeTab === "content" ? "bg-white shadow-voyago text-primary" : "text-foreground/40 hover:bg-white/50"
            )}
          >
            <Layout className="w-5 h-5" /> Contenu & Design
          </button>
          <button 
            onClick={() => setActiveTab("gallery")}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-left",
              activeTab === "gallery" ? "bg-white shadow-voyago text-primary" : "text-foreground/40 hover:bg-white/50"
            )}
          >
            <ImageIcon className="w-5 h-5" /> Galerie Photos
          </button>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 mt-12">
            <h4 className="text-sm font-black mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Astuce Design
            </h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Utilisez des images de haute qualité (1920x1080) pour votre bannière afin de rassurer vos futurs passagers.
            </p>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          {activeTab === "content" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-white space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Textes de présentation</h3>
                    <Input 
                      label="Slogan de la compagnie" 
                      placeholder="Le confort au meilleur prix" 
                      value={formData.slogan}
                      onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80 ml-1">Description détaillée</label>
                      <textarea 
                        className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] transition-all"
                        placeholder="Présentez votre compagnie, votre histoire et vos engagements..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Identité Visuelle</h3>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80 ml-1 font-bold">Couleur du thème</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="color" 
                          className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                          value={formData.themeColor}
                          onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                        />
                        <code className="bg-surface px-4 py-2 rounded-xl text-sm font-bold border border-border">{formData.themeColor.toUpperCase()}</code>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 pt-4">
                      <ImageUpload 
                        label="Logo de la compagnie"
                        value={formData.logoUrl}
                        onChange={(url) => setFormData({...formData, logoUrl: url})}
                      />
                      <ImageUpload 
                        label="Bannière principale"
                        value={formData.bannerUrl}
                        onChange={(url) => setFormData({...formData, bannerUrl: url})}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-black flex items-center gap-2 px-4 text-foreground/40 uppercase tracking-widest"><Eye className="w-4 h-4" /> Prévisualisation en direct</h3>
                <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white pointer-events-none origin-top scale-95 opacity-80">
                  <div className="h-40 w-full relative" style={{ backgroundColor: formData.themeColor }}>
                    {formData.bannerUrl && <img src={formData.bannerUrl} className="w-full h-full object-cover" alt="" />}
                    <div className="absolute -bottom-8 left-10 p-1.5 bg-white rounded-[1.5rem] shadow-xl">
                      <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center text-2xl font-black text-primary overflow-hidden">
                        {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover" alt="" /> : "V"}
                      </div>
                    </div>
                  </div>
                  <div className="p-10 pt-16">
                    <h4 className="text-3xl font-black mb-1">Votre Compagnie</h4>
                    <p className="text-lg text-primary italic font-medium" style={{ color: formData.themeColor }}>"{formData.slogan || "Slogan ici..."}"</p>
                    <div className="mt-8 prose prose-sm line-clamp-2 text-foreground/40">
                      {formData.description || "Votre description apparaîtra ici..."}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-white space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-black">Ajouter une photo à la galerie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <ImageUpload 
                      label="Photo du bus"
                      value={newImage.url}
                      onChange={(url) => setNewImage({...newImage, url: url})}
                    />
                    <div className="space-y-6">
                      <Input 
                        label="Légende de l'image"
                        placeholder="Ex: Intérieur de bus VIP" 
                        value={newImage.caption}
                        onChange={(e) => setNewImage({...newImage, caption: e.target.value})}
                      />
                      <Button className="w-full rounded-2xl h-14 font-black shadow-lg shadow-primary/20" onClick={handleAddGalleryImage} disabled={!newImage.url}>
                        <Plus className="w-5 h-5 mr-2" /> Publier dans la galerie
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-surface">
                  <h3 className="text-xl font-black mb-6">Photos actuelles ({gallery.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {gallery.map((img) => (
                      <div key={img.id} className="relative group aspect-video rounded-2xl overflow-hidden border border-border shadow-sm">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
                            onClick={() => handleDeleteImage(img.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 w-full p-2 bg-black/60 backdrop-blur-md text-[10px] text-white font-medium truncate">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                    {gallery.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl opacity-40">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-bold">Aucune photo dans la galerie.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
