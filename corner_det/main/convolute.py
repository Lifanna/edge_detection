def convolute(W, Mask, n):
    # input W(n,n), Mask(n,n), n
    value = 0

    for i in range(0, n):
        for j in range(0, n):
            value = value + W[i, j] * Mask[i, j]

    return value
    # end of function
