import { IForm } from "../forms/forms-interface";
import { ILandingPage } from "../landing-pages/landing-page-interfaces";
import { IContentSection } from "../shared/content-section-interface";
import { IDynamicContent } from "../shared/dynamic-content-interfaces";
import { IFieldMerge } from "../shared/field-merge-interface";
import { IHtmlContent } from "../shared/html-content-interface";
import { IHyperlink } from "../shared/hyperlink-interface";
import { IImage } from "../shared/image-interface";
import { IImportedFile } from "../shared/imported-file-interface";

export interface IEmail {
  accessedAt?: string;
  bounceBackEmail?: string;
  contentSections?: IContentSection[];
  createdAt?: string;
  createdBy?: string;
  currentStatus?: string;
  depth?: string;
  description?: string;
  dynamicContents?: IDynamicContent[];
  emailFooterId?: string;
  emailGroupId?: string;
  emailHeaderId?: string;
  encodingId?: string;
  fieldMerges?: IFieldMerge[];
  files?: IImportedFile[];
  forms?: IForm[];
  htmlContent?: IHtmlContent;
  hyperlinks?: IHyperlink[];
  id: number;
  images?: IImage[];
  isPlainTextEditable?: string;
  isTracked?: string;
  landingPages?: ILandingPage[];
  layout?: string;
  name?: string;
  permissions?: string;
  plainText?: string;
  replyToEmail?: string;
  replyToName?: string;
  senderEmail?: string;
  senderName?: string;
  sendPlainTextOnly?: string;
  style?: string;
  subject?: string;
  type?: string;
  updatedAt?: string;
  updatedBy?: string;
  virtualMTAId?: string;
}