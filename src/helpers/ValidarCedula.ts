
export function validarCedula(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) {
        return false;
    }
    const primerDigito = parseInt(cedula.charAt(0));
    if (primerDigito > 6) {
        return false;
    }
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let digito = parseInt(cedula.charAt(i));
        if (i % 2 === 0) { // Posiciones impares (0, 2, 4, 6, 8)
            digito *= 2;
            if (digito > 9) {
                digito -= 9; // Si el producto es mayor a 9, se resta 9
            }
        }
        suma += digito;
    }
    const digitoVerificador = (10 - (suma % 10)) % 10;

    return digitoVerificador === parseInt(cedula.charAt(9));
}
