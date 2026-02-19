import PyPDF2
import pdfplumber
import re
import nltk
from nltk.tokenize import sent_tokenize
import spacy
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class PDFProcessor:
    def __init__(self):
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except:
            logger.warning("SpaCy model not found. Downloading...")
            import subprocess
            subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])
            self.nlp = spacy.load('en_core_web_sm')
    
    def extract_text(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Extract text from PDF and split into chunks"""
        text_chunks = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    
                    if text:
                        # Clean text
                        text = self._clean_text(text)
                        
                        # Split into sentences
                        sentences = sent_tokenize(text)
                        
                        # Group sentences into chunks (3-5 sentences per chunk)
                        chunks = self._create_chunks(sentences, page_num)
                        text_chunks.extend(chunks)
                        
            logger.info(f"Extracted {len(text_chunks)} chunks from PDF")
            return text_chunks
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,;:?!()-]', '', text)
        
        return text.strip()
    
    def _create_chunks(self, sentences: List[str], page_num: int, chunk_size: int = 5) -> List[Dict[str, Any]]:
        """Group sentences into chunks"""
        chunks = []
        
        for i in range(0, len(sentences), chunk_size):
            chunk_sentences = sentences[i:i + chunk_size]
            chunk_text = ' '.join(chunk_sentences)
            
            # Skip very short chunks
            if len(chunk_text.split()) < 10:
                continue
            
            chunks.append({
                'text': chunk_text,
                'page': page_num,
                'chunk_id': f"p{page_num}_c{i//chunk_size}",
                'sentences': len(chunk_sentences)
            })
        
        return chunks
    
    def extract_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """Extract PDF metadata"""
        metadata = {}
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                metadata = {
                    'num_pages': len(pdf_reader.pages),
                    'pdf_version': pdf_reader.pdf_header,
                    'metadata': pdf_reader.metadata
                }
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
        
        return metadata