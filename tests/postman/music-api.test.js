pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);

});

pm.test("Response is in JSON format", function () {
    var jsonData = pm.response.json();
    pm.expect(typeof jsonData).to.be.equal('object');
});

pm.test("Response contains albums and images", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.albums).to.be.array();
});