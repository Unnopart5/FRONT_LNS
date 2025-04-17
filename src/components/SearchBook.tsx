import React, { useCallback, useState } from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce';
import { getBook } from '../services/Service';
import { ApiResponse, Book } from '../models/Book';
import Grid from '@mui/material/Grid2';

interface SearchBookProps {
  selectedBook: Book | null;
  setSelectedBook: React.Dispatch<React.SetStateAction<Book | null>>;
}

const SearchBook: React.FC<SearchBookProps> = ({ selectedBook, setSelectedBook }) => {
  const [inputValue, setInputValue] = useState(''); // Estado para manejar el valor del input

  const fetchBooks = useCallback(
    debounce(async (inputValue: string, callback: (options: any[]) => void) => {
      if (inputValue.trim().length < 5) { // 🔥 Busca desde el primer carácter
        callback([]);
        return;
      }

      try {
        const response: ApiResponse = await getBook(inputValue);
        if (response.estado === 200 && Array.isArray(response.data)) {
          const formattedOptions = response.data.map((book: Book) => ({
            value: book.codigoproducto,
            label: `${book.titulo} - ${book.serie}`,
            bookData: book,
          }));
          callback(formattedOptions);
        } else {
          callback([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        callback([]);
      }
    }, 500),
    []
  );

  const loadOptions = (inputValue: string, callback: (options: any[]) => void) => {
    fetchBooks(inputValue, callback);
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      textTransform: 'uppercase',
    }),
    input: (provided: any) => ({
      ...provided,
      textTransform: 'uppercase',
    }),
    option: (provided: any) => ({
      ...provided,
      textTransform: 'uppercase',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      textTransform: 'uppercase',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      textTransform: 'uppercase',
    }),
  };

  return (
    <div>
      <AsyncSelect
        loadOptions={loadOptions}
        defaultOptions
        placeholder="Digitar el código del libro..."
        noOptionsMessage={() => "NO SE ENCONTRARON CÓDIGOS RELACIONADOS"}
        isClearable
        getOptionValue={(option) => option.value}
        onChange={(selectedOption) => setSelectedBook(selectedOption?.bookData || null)}
        styles={customStyles} // Aplicamos los estilos personalizados
        inputValue={inputValue}
        onInputChange={(value) => setInputValue(value.toUpperCase())}
        formatOptionLabel={(option) => option.label.toUpperCase()}
      />
      
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