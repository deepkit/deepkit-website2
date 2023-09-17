router.get('/user/:id', async (id: number) => {
    return <User id={id}></User>
});
