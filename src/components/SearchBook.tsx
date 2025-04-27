import React, { useCallback, useState } from 'react';
import { getBook } from '../services/Service';
import { ApiResponse, Book } from '../models/Book';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface SearchBookProps {
  selectedBook: Book | null;
  setSelectedBook: React.Dispatch<React.SetStateAction<Book | null>>;
}

const SearchBook: React.FC<SearchBookProps> = ({ selectedBook, setSelectedBook }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      setSearchError('Por favor ingrese un código');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    
    try {
      const response: ApiResponse = await getBook(inputValue);
      if (response.estado === 200 && Array.isArray(response.data) && response.data.length > 0) {
        setSelectedBook(response.data[0]);
      } else {
        setSearchError('No se encontraron libros con ese código');
        setSelectedBook(null);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setSearchError('Error al buscar el libro');
      setSelectedBook(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Digitar el código del libro"
          error={!!searchError}
          helperText={searchError}
          sx={{
            '& .MuiInputBase-input': {
              textTransform: 'uppercase'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={isSearching}
          sx={{ height: '56px' }}
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </Button>
      </Box>
      
      {selectedBook && (
        <div style={{ marginTop: '10px' }}>
          <h3>LIBRO SELECCIONADO:</h3>
          <Grid container spacing={1}>
            <Grid size={6}>
              <p><strong>SKU:</strong> {selectedBook.sku.toUpperCase()}</p>
            </Grid>
            <Grid size={6}>
              <p><strong>SERIE:</strong> {selectedBook.serie.toUpperCase()}</p>
            </Grid>
            <Grid size={6}>
              <p><strong>TÍTULO:</strong> {selectedBook.titulo.toUpperCase()}</p>
            </Grid>
            <Grid size={6}>
              <p><strong>PERIODO:</strong> {selectedBook.periodo.toUpperCase()}</p>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default SearchBook;