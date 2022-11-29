$(document).ready(function () {
  $('#tableUsers').DataTable({
    "lengthMenu": [[3, 5, 10, -1], [3, 5, 10, "All"]],
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
        render: function (data) {
          return `
                    
                    <a type="button" href ="/users/edit/${data}" class='btn btn-success rounded-circle'><i class="fa-solid fa-circle-info"></i></a>
                   
<button type="button" class="btn btn-danger rounded-circle" data-toggle="modal" data-target="#exampleModal${data}">
<i class="fa-solid fa-trash"></i>
</button>


<div class="modal fade" id="exampleModal${data}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        Are you sure want to delete it?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <a href="/users/delete/${data}" type="button" class="btn btn-primary">Save changes</a>
      </div>
    </div>
  </div>
</div>
                    
                    `
        }
      },
    ]
  });

  $('#tableUnits').DataTable({
    "lengthMenu": [[3, 5, 10, -1], [3, 5, 10, "All"]],
    "processing": true,
    "serverSide": true,
    "ajax": "/units/datatable",
    "columns": [
      { "data": "unit" },
      { "data": "name" },
      { "data": "note" },
      {
        "data": "unit",
        render: function (data) {
          return `
                  
                  <a type="button" href ="/units/edit/${data}" class='btn btn-success rounded-circle'><i class="fa-solid fa-circle-info"></i></a>
                 
<button type="button" class="btn btn-danger rounded-circle" data-toggle="modal" data-target="#exampleModal${data}">
<i class="fa-solid fa-trash"></i>
</button>


<div class="modal fade" id="exampleModal${data}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      Are you sure want to delete it?
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      <a href="/units/delete/${data}" type="button" class="btn btn-primary">Save changes</a>
    </div>
  </div>
</div>
</div>
                  
                  `
        }
      },
    ]
  });

  $('#tableGoods').DataTable({
    "lengthMenu": [[3, 5, 10, 100], [3, 5, 10, 100]],
    "processing": true,
    "serverSide": true,
    "ajax": "/goods/datatable",
    "columns": [
      { "data": "barcode" },
      { "data": "name" },
      { "data": "stock" },
      { "data": "purchaseprice" },
      { "data": "sellingprice" },
      { "data": "unit" },
      { 
        "data": "picture",
        render: function(data){
          return `<img src="/images/upload/${data}" width="100" /> `
        }
     },
      {
        "data": "barcode",
        render: function (data) {
          return `
                  
                  <a type="button" href ="/goods/edit/${data}" class='btn btn-success rounded-circle'><i class="fa-solid fa-circle-info"></i></a>
                 
<button type="button" class="btn btn-danger rounded-circle" data-toggle="modal" data-target="#exampleModal${data}">
<i class="fa-solid fa-trash"></i>
</button>


<div class="modal fade" id="exampleModal${data}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      Are you sure want to delete it?
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      <a href="/goods/delete/${data}" type="button" class="btn btn-primary">Save changes</a>
    </div>
  </div>
</div>
</div>
                  
                  `
        }
      },
    ]
  });

  $('#tableSuppliers').DataTable({
    "lengthMenu": [[3, 5, 10, -1], [3, 5, 10, "All"]],
    "processing": true,
    "serverSide": true,
    "ajax": "/suppliers/datatable",
    "columns": [
      { "data": "supplierid" },
      { "data": "name" },
      { "data": "address" },
      { "data": "phone" },
      {
        "data": "supplierid",
        render: function (data) {
          return `
                  
                  <a type="button" href ="/suppliers/edit/${data}" class='btn btn-success rounded-circle'><i class="fa-solid fa-circle-info"></i></a>
                 
<button type="button" class="btn btn-danger rounded-circle" data-toggle="modal" data-target="#exampleModal${data}">
<i class="fa-solid fa-trash"></i>
</button>


<div class="modal fade" id="exampleModal${data}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      Are you sure want to delete it?
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      <a href="/suppliers/delete/${data}" type="button" class="btn btn-primary">Save changes</a>
    </div>
  </div>
</div>
</div>
                  
                  `
        }
      },
    ]
  });
  $('#tablePurchase').DataTable({
    "lengthMenu": [[3, 5, 10, 100], [3, 5, 10, 100]],
    "processing": true,
    "serverSide": true,
    "ajax": "/purchase/datatable",
    "columns": [
      { "data": "invoice" },
      { "data": "time" },
      { "data": "totalsummary" },
      { "data": "supplier" },
      {
        "data": "invoice",
        render: function (data) {
          return `
                  
                  <a type="button" href ="/purchase/edit/${data}" class='btn btn-success rounded-circle'><i class="fa-solid fa-circle-info"></i></a>
                 
<button type="button" class="btn btn-danger rounded-circle" data-toggle="modal" data-target="#exampleModal${data}">
<i class="fa-solid fa-trash"></i>
</button>


<div class="modal fade" id="exampleModal${data}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      Are you sure want to delete it?
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      <a href="/purchase/delete/${data}" type="button" class="btn btn-primary">Save changes</a>
    </div>
  </div>
</div>
</div>
                  
                  `
        }
      },
    ]
  });

});

