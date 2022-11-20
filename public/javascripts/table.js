$(document).ready(function () {
    $('#tableUsers').DataTable({
        "lengthMenu": [[1, 5,10, -1], [1, 5, 10, "All"]],
        "processing": true,
        "serverSide": true,
        "ajax": "/users/datatable",
        "columns": [
            { "data": "userid" },
            { "data": "email" },
            { "data": "name" },
            { "data": "role" },
            {
                "data": "userid",
                render : function (data){
                    return ``
                }
            },
        ]
    });
});