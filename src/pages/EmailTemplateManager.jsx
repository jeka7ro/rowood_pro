import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '@/entities/EmailTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Mail, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const allTemplates = await EmailTemplate.list();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate({
      template_name: '',
      template_type: 'order_confirmation',
      subject: '',
      html_body: '',
      language_code: 'ro',
      is_active: true,
      variables: ['{{customer_name}}', '{{order_number}}', '{{order_total}}', '{{order_date}}', '{{company_name}}']
    });
    setIsEditing(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setSelectedTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedTemplate.id) {
        await EmailTemplate.update(selectedTemplate.id, selectedTemplate);
      } else {
        await EmailTemplate.create(selectedTemplate);
      }
      alert('Template-ul a fost salvat cu succes!');
      setIsEditing(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Eroare la salvarea template-ului.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Ești sigur că vrei să ștergi acest template?')) {
      try {
        await EmailTemplate.delete(id);
        loadTemplates();
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Eroare la ștergerea template-ului.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Template-uri Email
          </h1>
          <p className="text-muted-foreground">Configurează template-urile pentru emailurile automate ale sistemului.</p>
        </div>
        <Button onClick={handleNewTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          Template Nou
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lista Template-uri</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Limba</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.template_name}</TableCell>
                    <TableCell>{template.template_type}</TableCell>
                    <TableCell>{template.language_code}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                          Editează
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isEditing && selectedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle>Editare Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template_name">Nume Template</Label>
                <Input id="template_name" name="template_name" value={selectedTemplate.template_name} onChange={handleInputChange} />
              </div>
              
              <div>
                <Label htmlFor="template_type">Tip Template</Label>
                <Select value={selectedTemplate.template_type} onValueChange={(value) => handleSelectChange('template_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_confirmation">Confirmare Comandă</SelectItem>
                    <SelectItem value="order_status_update">Actualizare Status</SelectItem>
                    <SelectItem value="invoice_sent">Factură Trimisă</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language_code">Limba</Label>
                <Select value={selectedTemplate.language_code} onValueChange={(value) => handleSelectChange('language_code', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">Engleză</SelectItem>
                    <SelectItem value="de">Germană</SelectItem>
                    <SelectItem value="fr">Franceză</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subiect Email</Label>
                <Input id="subject" name="subject" value={selectedTemplate.subject} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="html_body">Corpul Emailului (HTML)</Label>
                <Textarea 
                  id="html_body" 
                  name="html_body" 
                  value={selectedTemplate.html_body} 
                  onChange={handleInputChange}
                  rows={10}
                  placeholder="Folosește variabile precum {{customer_name}}, {{order_number}}, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvează
                </Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setSelectedTemplate(null); }}>
                  Anulează
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}